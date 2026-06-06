'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/whatsapp/'

export type WhatsAppEvent =
  | { type: 'message.received'; messageId: number; conversationId: number; contactPhone: string; contactName: string; content: string; direction: 'incoming'; createdAt: string }
  | { type: 'message.queued'; messageId: number; conversationId: number; content: string; direction: 'outgoing'; status: string; scheduledAt: string | null; createdAt: string }
  | { type: 'message.status'; messageId: number; status: string; conversationId: number }
  | { type: 'campaign.status'; campaignId: number; status: string }

export function useWhatsAppSocket(onEvent?: (event: WhatsAppEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        const event: WhatsAppEvent = JSON.parse(e.data)

        if (event.type === 'message.received' || event.type === 'message.queued') {
          queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] })
          queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', event.conversationId] })
        }
        if (event.type === 'message.status') {
          queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', event.conversationId] })
        }
        if (event.type === 'campaign.status') {
          queryClient.invalidateQueries({ queryKey: ['whatsapp', 'campaigns'] })
        }

        onEventRef.current?.(event)
      } catch {}
    }

    ws.onclose = () => {
      // Reconectar tras 3s si la conexión se pierde
      setTimeout(connect, 3000)
    }
  }, [queryClient])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])
}
