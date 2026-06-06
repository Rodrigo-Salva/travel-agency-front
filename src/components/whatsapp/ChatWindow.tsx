'use client'

import { useEffect, useRef } from 'react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Clock, Check, CheckCheck, AlertCircle, Ban } from 'lucide-react'
import { toast } from 'sonner'
import { whatsappApi, type WAMessage } from '@/lib/api/whatsapp'

interface Props {
  messages: WAMessage[]
  conversationId: number
}

function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "d 'de' MMMM yyyy", { locale: es })
}

function StatusIcon({ status }: { status: WAMessage['status'] }) {
  switch (status) {
    case 'pending':   return <Clock className="h-3 w-3 text-white/40" />
    case 'queued':    return <Clock className="h-3 w-3 text-amber-300" />
    case 'sent':      return <Check className="h-3 w-3 text-white/50" />
    case 'delivered': return <CheckCheck className="h-3 w-3 text-white/50" />
    case 'read':      return <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
    case 'failed':    return <AlertCircle className="h-3 w-3 text-red-400" />
    case 'cancelled': return <Ban className="h-3 w-3 text-white/30" />
    default:          return null
  }
}

export function ChatWindow({ messages, conversationId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const cancelMutation = useMutation({
    mutationFn: (messageId: number) => whatsappApi.cancelMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', conversationId] })
      toast.success('Mensaje cancelado')
    },
    onError: () => toast.error('No se pudo cancelar el mensaje'),
  })

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-steel/40">
        <p className="text-sm">No hay mensajes aún</p>
        <p className="text-xs">Escribe un mensaje para iniciar la conversación</p>
      </div>
    )
  }

  // Group messages by date and add date separators
  const groups: { date: Date; messages: WAMessage[] }[] = []
  for (const msg of messages) {
    const d = new Date(msg.created_at)
    const last = groups[groups.length - 1]
    if (!last || !isSameDay(last.date, d)) {
      groups.push({ date: d, messages: [msg] })
    } else {
      last.messages.push(msg)
    }
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-4 overflow-y-auto h-full">
      {groups.map((group, gi) => (
        <div key={gi}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-brand-steel/50 px-3 py-1 rounded-full bg-white/5 whitespace-nowrap">
              {formatDateLabel(group.date)}
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-1">
            {group.messages.map((msg, mi) => {
              const isOut = msg.direction === 'outgoing'
              const canCancel = isOut && (msg.status === 'queued' || msg.status === 'pending') && msg.job_id
              const isCancelled = msg.status === 'cancelled'

              // Bubble tail: show tail only on last message in a consecutive run from same direction
              const next = group.messages[mi + 1]
              const isLastInRun = !next || next.direction !== msg.direction

              return (
                <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'} ${mi > 0 && group.messages[mi - 1].direction === msg.direction ? 'mt-0.5' : 'mt-2'}`}>
                  <div className={`relative group max-w-[70%] ${isCancelled ? 'opacity-40' : ''}`}>
                    {/* Bubble */}
                    <div
                      className={`relative px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm ${
                        isOut
                          ? 'bg-brand-wine text-white'
                          : 'bg-brand-dark text-white'
                      } ${
                        isLastInRun
                          ? isOut
                            ? 'rounded-2xl rounded-br-sm'
                            : 'rounded-2xl rounded-bl-sm'
                          : 'rounded-2xl'
                      }`}
                    >
                      {msg.content}

                      {/* Timestamp + status row */}
                      <div className={`flex items-center gap-1 mt-1 ${isOut ? 'justify-end' : 'justify-start'}`}>
                        {msg.scheduled_at && msg.status === 'queued' && (
                          <span className="text-[10px] text-amber-300/80">
                            📅 {format(new Date(msg.scheduled_at), 'HH:mm')}
                          </span>
                        )}
                        <span className="text-[10px] text-white/40">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {isOut && <StatusIcon status={msg.status} />}
                      </div>
                    </div>

                    {/* Cancel button on hover */}
                    {canCancel && (
                      <button
                        onClick={() => cancelMutation.mutate(msg.id)}
                        title="Cancelar envío"
                        className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-lg z-10"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  )
}
