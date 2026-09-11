import { get, post, put } from '@/utils/request'

export function getAgentConfigApi() { return get('/ai-advisor/config') }
export function getAvailableAgentsApi() { return get('/ai-advisor/agents') }
export function updateAgentConfigApi(agentId) { return put('/ai-advisor/config', { agentId }) }
export function getPersonalAgentUsageApi() { return get('/ai-advisor/usage/personal') }
export function getAgentUsageApi() { return get('/ai-advisor/usage') }

export function sendAgentMessageApi({ message, conversationId }) {
  return post('/ai-advisor/chat', { message, ...(conversationId ? { conversationId } : {}) }, { timeout: 120000 })
}
