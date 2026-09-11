const axios = require('axios');

const DEFAULT_TIMEOUT_MS = 120000;

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function mapSafeAgent(row) {
  const source = row && typeof row === 'object' ? row : {};
  const agentId = String(source.agentId || source.agent_id || '').trim();
  if (!agentId) {
    throw new Error('上游 Agent 缺少 agentId');
  }

  return {
    agentId,
    name: String(source.name || source.displayName || source.display_name || '').trim(),
    description: String(source.description || '').trim(),
    icon: String(source.icon || '').trim(),
    agentClass: Number(source.agentClass || source.agent_class || 1) === 2 ? 2 : 1
  };
}

function createServiceError(code, message, statusCode, cause) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  error.cause = cause;
  return error;
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function createAgentOpenApiService(options = {}) {
  const httpClient = options.httpClient || axios;
  const baseUrl = normalizeBaseUrl(
    options.baseUrl === undefined ? process.env.AGENT_OPENAPI_BASE_URL : options.baseUrl
  );
  const apiKey = String(
    options.apiKey === undefined ? process.env.AGENT_OPENAPI_API_KEY || '' : options.apiKey
  ).trim();
  const timeout = Number(options.timeoutMs || process.env.AGENT_OPENAPI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  function ensureConfigured() {
    if (!baseUrl || !apiKey) {
      throw createServiceError(
        'AGENT_OPENAPI_NOT_CONFIGURED',
        'Agent 服务暂未配置',
        503
      );
    }
  }

  function requestOptions(extra = {}) {
    ensureConfigured();
    return {
      timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS,
      ...extra,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(extra.headers || {})
      }
    };
  }

  function handleUpstreamError(error) {
    const statusCode = Number(error?.response?.status || 0);
    if (statusCode === 401) {
      throw createServiceError('AGENT_OPENAPI_UNAUTHORIZED', 'Agent 服务认证失败，请联系管理员', 502, error);
    }
    if (statusCode === 403 || statusCode === 404) {
      throw createServiceError('AGENT_OPENAPI_AGENT_UNAVAILABLE', '当前 Agent 暂不可用', 502, error);
    }
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      throw createServiceError('AGENT_OPENAPI_TIMEOUT', 'Agent 响应超时，请稍后重试', 504, error);
    }
    throw createServiceError('AGENT_OPENAPI_UPSTREAM_ERROR', 'Agent 服务暂时不可用，请稍后重试', 502, error);
  }

  return {
    async listAgents() {
      try {
        const response = await httpClient.get(`${baseUrl}/openapi/v1/agents`, requestOptions());
        return extractList(response.data).map(mapSafeAgent);
      } catch (error) {
        if (error.code && error.statusCode) throw error;
        handleUpstreamError(error);
      }
    },

    async chat({ agentId, message, externalUserId, conversationId, requestId, metadata } = {}) {
      ensureConfigured();
      const normalizedAgentId = String(agentId || '').trim();
      const normalizedMessage = String(message || '').trim();
      const normalizedUserId = String(externalUserId || '').trim();
      if (!normalizedAgentId) throw createServiceError('INVALID_AGENT_ID', 'Agent 配置无效', 400);
      if (!normalizedMessage) throw createServiceError('INVALID_MESSAGE', '请输入对话内容', 400);
      if (!normalizedUserId) throw createServiceError('INVALID_EXTERNAL_USER_ID', '用户身份无效', 400);

      const body = {
        agentId: normalizedAgentId,
        message: normalizedMessage,
        externalUserId: normalizedUserId
      };
      if (conversationId) body.conversationId = String(conversationId);
      if (requestId) body.metadata = { ...(metadata || {}), requestId: String(requestId) };

      try {
        const response = await httpClient.post(
          `${baseUrl}/openapi/v1/chat/completions`,
          body,
          requestOptions({ headers: requestId ? { 'X-Request-Id': String(requestId) } : {} })
        );
        return response.data;
      } catch (error) {
        if (error.code && error.statusCode) throw error;
        handleUpstreamError(error);
      }
    },

    isConfigured() {
      return Boolean(baseUrl && apiKey);
    }
  };
}

module.exports = {
  createAgentOpenApiService,
  mapSafeAgent
};
