import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'

export interface AppNotification {
  id: number
  type: 'booking' | 'payment' | 'review' | 'promo' | 'system'
  title: string
  message: string
  is_read: boolean
  link: string
  created_at: string
}

export interface NotificationsResponse {
  exito: boolean
  unread: number
  notifications: AppNotification[]
}

export const notificationsApi = {
  async list(): Promise<NotificationsResponse> {
    const { data } = await apiClient.get<NotificationsResponse>(API.notifications)
    return data
  },
  async markAllRead(): Promise<void> {
    await apiClient.post(API.markAllRead)
  },
  async markRead(id: number): Promise<void> {
    await apiClient.post(API.markRead(id))
  },
}
