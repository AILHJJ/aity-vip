/**
 * 图灵AI代理控制器
 * 负责代理通达信问小达API请求，自动处理token认证和刷新
 */

const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const TDX_CONFIG = {
  // 通达信API地址
  API_URL: 'https://www.tdx.com.cn/wenda/api',

  // 登录相关
  LOGIN_URL: 'https://pul.tdx.com.cn/site/app/pul/login_do.jsp',

  // 凭证配置 - 从环境变量或配置文件读取
  CREDENTIALS: {
    login_id: process.env.TDX_LOGIN_ID || '13545023884',
    login_pwd: process.env.TDX_LOGIN_PWD || '123456'
  },

  // Token缓存文件路径
  TOKEN_FILE: path.join(__dirname, '..', '..', 'data', 'tdx-token.json'),

  // Token有效期（毫秒）- 默认12小时
  TOKEN_TTL: 12 * 60 * 60 * 1000
};

// 内存中的token缓存
let tokenCache = {
  token: null,
  expiresAt: 0,
  lastRefresh: 0
};

/**
 * 确保数据目录存在
 */
function ensureDataDir() {
  const dataDir = path.dirname(TDX_CONFIG.TOKEN_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * 从文件加载token
 */
function loadTokenFromFile() {
  try {
    if (fs.existsSync(TDX_CONFIG.TOKEN_FILE)) {
      const data = fs.readFileSync(TDX_CONFIG.TOKEN_FILE, 'utf8');
      const parsed = JSON.parse(data);
      tokenCache = {
        token: parsed.token,
        expiresAt: parsed.expiresAt || 0,
        lastRefresh: parsed.lastRefresh || 0
      };
      console.log('[TDX] 从文件加载token:', parsed.token ? '成功' : '失败');
      return parsed.token;
    }
  } catch (error) {
    console.error('[TDX] 加载token文件失败:', error.message);
  }
  return null;
}

/**
 * 保存token到文件
 */
function saveTokenToFile(token, expiresAt) {
  try {
    ensureDataDir();
    const data = {
      token,
      expiresAt,
      lastRefresh: Date.now()
    };
    fs.writeFileSync(TDX_CONFIG.TOKEN_FILE, JSON.stringify(data, null, 2));
    console.log('[TDX] Token已保存到文件');
  } catch (error) {
    console.error('[TDX] 保存token文件失败:', error.message);
  }
}

/**
 * 检查token是否有效
 */
function isTokenValid() {
  if (!tokenCache.token) return false;
  if (Date.now() > tokenCache.expiresAt) return false;
  return true;
}

/**
 * 登录通达信获取token
 * 注意：由于通达信服务器对直接HTTP请求有限制，这个方法可能需要调整
 */
async function loginToTDX() {
  console.log('[TDX] 尝试登录通达信...');

  // 创建自定义HTTPS Agent，忽略某些SSL限制
  const httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: true,
    maxSockets: 10
  });

  try {
    // 方式1: 尝试PUL登录
    const response = await axios.post(
      TDX_CONFIG.LOGIN_URL,
      new URLSearchParams({
        login_id: TDX_CONFIG.CREDENTIALS.login_id,
        login_pwd: TDX_CONFIG.CREDENTIALS.login_pwd
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://pul.tdx.com.cn',
          'Referer': 'https://pul.tdx.com.cn/site/app/pul/login.html',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Connection': 'keep-alive'
        },
        httpsAgent,
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      }
    );

    console.log('[TDX] 登录响应状态:', response.status);

    // 从响应头获取Set-Cookie中的token
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      for (const cookie of setCookies) {
        // 查找tdx-auth或类似的token
        const match = cookie.match(/tdx-auth=([^;]+)/);
        if (match) {
          const token = match[1];
          const expiresAt = Date.now() + TDX_CONFIG.TOKEN_TTL;

          tokenCache = { token, expiresAt, lastRefresh: Date.now() };
          saveTokenToFile(token, expiresAt);

          console.log('[TDX] 登录成功，获取到token');
          return token;
        }
      }
    }

    // 检查响应体中是否有token
    if (response.data && typeof response.data === 'string') {
      const tokenMatch = response.data.match(/tdx-auth["']?\s*[:=]\s*["']([^"']+)["']/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        const expiresAt = Date.now() + TDX_CONFIG.TOKEN_TTL;

        tokenCache = { token, expiresAt, lastRefresh: Date.now() };
        saveTokenToFile(token, expiresAt);

        console.log('[TDX] 从响应体获取到token');
        return token;
      }
    }

    console.log('[TDX] 登录响应中未找到token');
    console.log('[TDX] 响应头:', JSON.stringify(response.headers, null, 2));

    return null;
  } catch (error) {
    if (error.response) {
      console.error('[TDX] 登录失败 - HTTP状态:', error.response.status);
      console.error('[TDX] 响应:', error.response.data);
    } else {
      console.error('[TDX] 登录失败:', error.message);
    }
    return null;
  }
}

/**
 * 使用备用方式获取token - 直接使用硬编码的token（需要手动更新）
 */
function getFallbackToken() {
  // 这里可以配置多个备用token，当自动登录失败时使用
  // 最新token: 2026-02-24 更新
  const fallbackTokens = [
    // 最新获取的token
    '33e3f141aae0432f9ff91e61b1102252_1_JX_2',
    // 旧token（备用）
    'b10a313eed574aa4945e912e593673d3_1_JX_2'
  ];

  for (const token of fallbackTokens) {
    if (token) {
      console.log('[TDX] 使用备用token');
      return token;
    }
  }
  return null;
}

/**
 * 获取有效的token
 */
async function getValidToken() {
  // 1. 首先检查内存缓存
  if (isTokenValid()) {
    return tokenCache.token;
  }

  // 2. 尝试从文件加载
  if (!tokenCache.token) {
    loadTokenFromFile();
  }

  // 3. 如果文件中的token有效，使用它
  if (isTokenValid()) {
    return tokenCache.token;
  }

  // 4. 尝试登录获取新token
  const newToken = await loginToTDX();
  if (newToken) {
    return newToken;
  }

  // 5. 使用备用token
  const fallbackToken = getFallbackToken();
  if (fallbackToken) {
    // 设置较短的过期时间，以便定期尝试刷新
    tokenCache = {
      token: fallbackToken,
      expiresAt: Date.now() + TDX_CONFIG.TOKEN_TTL,
      lastRefresh: Date.now()
    };
    return fallbackToken;
  }

  return null;
}

/**
 * 获取token状态
 */
const getTokenStatus = async (req, res) => {
  try {
    const token = await getValidToken();
    const isValid = isTokenValid();

    res.json({
      code: 200,
      data: {
        hasToken: !!token,
        isValid,
        expiresAt: tokenCache.expiresAt,
        lastRefresh: tokenCache.lastRefresh,
        expiresIn: tokenCache.expiresAt > 0 ? Math.max(0, tokenCache.expiresAt - Date.now()) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取token状态失败',
      error: error.message
    });
  }
};

/**
 * 手动刷新token
 */
const refreshToken = async (req, res) => {
  try {
    // 清除当前缓存
    tokenCache = { token: null, expiresAt: 0, lastRefresh: 0 };

    // 尝试获取新token
    const token = await getValidToken();

    if (token) {
      res.json({
        code: 200,
        message: 'Token刷新成功',
        data: {
          hasToken: true,
          expiresAt: tokenCache.expiresAt,
          expiresIn: tokenCache.expiresAt > 0 ? Math.max(0, tokenCache.expiresAt - Date.now()) : 0
        }
      });
    } else {
      res.json({
        code: 500,
        message: 'Token刷新失败，请检查登录凭证或手动更新token'
      });
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Token刷新失败',
      error: error.message
    });
  }
};

/**
 * 代理聊天请求
 */
const proxyChat = async (req, res) => {
  try {
    const token = await getValidToken();
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '无法获取有效的token，请联系管理员更新凭证'
      });
    }

    const { content, threadId, agent, think } = req.body;

    const response = await axios.post(
      `${TDX_CONFIG.API_URL}/agent/chat`,
      {
        content,
        threadId: threadId || '',
        agent: agent || 'wenda',
        think: think || false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'tdx-auth': token
        },
        timeout: 60000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[TDX] 代理聊天请求失败:', error.message);

    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      tokenCache = { token: null, expiresAt: 0, lastRefresh: 0 };
      return res.status(401).json({
        code: 401,
        message: 'Token已过期，请重试或联系管理员刷新token'
      });
    }

    res.status(error.response?.status || 500).json({
      code: error.response?.status || 500,
      message: error.message
    });
  }
};

/**
 * 代理流式聊天请求
 */
const proxyStreamChat = async (req, res) => {
  try {
    const token = await getValidToken();
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '无法获取有效的token，请联系管理员更新凭证'
      });
    }

    const { content, threadId, agent, think } = req.body;

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(
      `${TDX_CONFIG.API_URL}/agent/stream/chat`,
      {
        content,
        threadId: threadId || '',
        agent: agent || 'wenda',
        think: think || false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'tdx-auth': token
        },
        responseType: 'stream',
        timeout: 120000
      }
    );

    // 管道流式响应
    response.data.on('data', (chunk) => {
      res.write(chunk);
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('[TDX] 流式响应错误:', error.message);
      res.end();
    });

    // 处理客户端断开连接
    req.on('close', () => {
      response.data.destroy();
    });

  } catch (error) {
    console.error('[TDX] 代理流式聊天请求失败:', error.message);

    if (error.response?.status === 401) {
      // Token过期，清除缓存
      tokenCache = { token: null, expiresAt: 0, lastRefresh: 0 };
      res.write(`event: error\ndata: ${JSON.stringify({ code: 401, message: 'Token已过期' })}\n\n`);
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ code: 500, message: error.message })}\n\n`);
    }
    res.end();
  }
};

/**
 * 手动设置token（管理员接口）
 */
const setToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        code: 400,
        message: 'Token不能为空'
      });
    }

    const expiresAt = Date.now() + TDX_CONFIG.TOKEN_TTL;
    tokenCache = { token, expiresAt, lastRefresh: Date.now() };
    saveTokenToFile(token, expiresAt);

    res.json({
      code: 200,
      message: 'Token设置成功',
      data: {
        expiresAt,
        expiresIn: TDX_CONFIG.TOKEN_TTL
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'Token设置失败',
      error: error.message
    });
  }
};

module.exports = {
  getTokenStatus,
  refreshToken,
  proxyChat,
  proxyStreamChat,
  setToken,
  getValidToken
};
