import { apiClient } from './client'
import { API } from './endpoints'

export interface WAContact {
  id: number
  phone: string
  name: string
  created_at: string
}

export interface WAConversation {
  id: number
  contact: WAContact
  last_message_at: string | null
  unread_count: number
  last_message: { content: string; direction: string; status: string } | null
}

export interface WAMessage {
  id: number
  conversation: number
  direction: 'incoming' | 'outgoing'
  content: string
  status: 'pending' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled'
  scheduled_at: string | null
  sent_at: string | null
  waha_message_id: string | null
  job_id: string | null
  created_at: string
}

export interface WACampaign {
  id: number
  name: string
  message_template: string
  contacts: WAContact[]
  delay_between_ms: number
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed'
  created_by: string
  job_id: string | null
  scheduled_at: string | null
  created_at: string
}

export const whatsappApi = {
  getConversations: () =>
    apiClient.get<{ results: WAConversation[] } | WAConversation[]>(API.whatsapp.conversations)
      .then(r => Array.isArray(r.data) ? r.data : (r.data as any).results ?? []),

  getMessages: (conversationId: number) =>
    apiClient.get<{ results: WAMessage[] } | WAMessage[]>(API.whatsapp.messages(conversationId))
      .then(r => Array.isArray(r.data) ? r.data : (r.data as any).results ?? []),

  sendMessage: (chatId: string, content: string, delayMs = 0, priority = 5) =>
    apiClient.post<WAMessage>(API.whatsapp.send, { chat_id: chatId, content, delay_ms: delayMs, priority }).then(r => r.data),

  cancelMessage: (messageId: number) =>
    apiClient.delete(API.whatsapp.cancelMessage(messageId)).then(r => r.data),

  clearChat: (conversationId: number) =>
    apiClient.delete(API.whatsapp.clearChat(conversationId)).then(r => r.data),

  getCampaigns: () =>
    apiClient.get<{ results: WACampaign[] } | WACampaign[]>(API.whatsapp.campaigns)
      .then(r => Array.isArray(r.data) ? r.data : (r.data as any).results ?? []),

  createCampaign: (data: { name: string; message_template: string; contact_ids: number[]; delay_between_ms: number }) =>
    apiClient.post<WACampaign>(API.whatsapp.campaigns, data).then(r => r.data),

  launchCampaign: (id: number) =>
    apiClient.post<WACampaign>(API.whatsapp.launchCampaign(id), {}).then(r => r.data),

  getQueueStats: () =>
    apiClient.get(API.whatsapp.queueStats).then(r => r.data),

  getSessionStatus: () =>
    apiClient.get<{
      status: string
      name: string
      me?: { id: string; pushName: string } | null
      engine?: any
    }>(API.whatsapp.session).then(r => r.data),

  startSession: () =>
    apiClient.post(API.whatsapp.sessionStart, {}).then(r => r.data),

  logoutSession: () =>
    apiClient.post(API.whatsapp.sessionLogout, {}).then(r => r.data),

  getQrUrl: () => {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/').replace(/\/$/, '')
    return `${base}/whatsapp/session/qr/`
  },
}
