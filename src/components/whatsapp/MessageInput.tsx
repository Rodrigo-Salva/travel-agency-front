'use client'

import { useState, useRef } from 'react'
import { Send, Loader2, Clock, X, ChevronUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { whatsappApi } from '@/lib/api/whatsapp'

interface Props {
  chatId: string
  conversationId: number
}

const DELAY_PRESETS = [
  { label: 'Ahora',  ms: 0,                    color: 'text-white/60' },
  { label: '5 min',  ms: 5 * 60 * 1000,        color: 'text-amber-400' },
  { label: '1 h',    ms: 60 * 60 * 1000,       color: 'text-orange-400' },
  { label: '24 h',   ms: 24 * 60 * 60 * 1000,  color: 'text-rose-400' },
]

function formatDelay(ms: number): string {
  if (ms === 0) return ''
  if (ms < 3600000) return `+${Math.round(ms / 60000)} min`
  return `+${Math.round(ms / 3600000)} h`
}

export function MessageInput({ chatId, conversationId }: Props) {
  const [content, setContent] = useState('')
  const [delayMs, setDelayMs] = useState(0)
  const [showDelay, setShowDelay] = useState(false)
  const [customMin, setCustomMin] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => whatsappApi.sendMessage(chatId, content, delayMs),
    onSuccess: () => {
      setContent('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] })
      const label = delayMs > 0 ? `Programado ${formatDelay(delayMs)}` : 'Enviado'
      toast.success(label)
    },
    onError: () => toast.error('Error al enviar'),
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (content.trim() && !mutation.isPending) mutation.mutate()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  const applyCustom = () => {
    const mins = parseInt(customMin, 10)
    if (mins > 0) { setDelayMs(mins * 60_000); setCustomMin(''); setShowDelay(false) }
  }

  const canSend = content.trim().length > 0 && !mutation.isPending
  const hasDelay = delayMs > 0

  return (
    <div className="border-t border-brand-steel/10 bg-brand-dark shrink-0">

      {/* Delay panel — slides up from inside the bar */}
      {showDelay && (
        <div className="px-4 py-3 border-b border-brand-steel/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">Delay de envío</span>
            <button onClick={() => setShowDelay(false)} className="text-white/30 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preset pills */}
          <div className="flex gap-2 flex-wrap">
            {DELAY_PRESETS.map(p => (
              <button
                key={p.ms}
                onClick={() => { setDelayMs(p.ms); if (p.ms === 0) setShowDelay(false) }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  delayMs === p.ms
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={10080}
              placeholder="Minutos personalizados..."
              value={customMin}
              onChange={e => setCustomMin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyCustom()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40"
            />
            <button
              onClick={applyCustom}
              disabled={!customMin || parseInt(customMin) < 1}
              className="px-3 py-2 rounded-xl bg-brand-wine/80 hover:bg-brand-wine disabled:opacity-30 text-white text-xs font-medium transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2">

        {/* Clock / delay button */}
        <button
          onClick={() => setShowDelay(!showDelay)}
          title="Programar delay"
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
            showDelay || hasDelay
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-white/30 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <Clock className="h-4.5 w-4.5" />
          {hasDelay && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
              {formatDelay(delayMs)}
            </span>
          )}
        </button>

        {/* Text area bubble */}
        <div className="flex-1 bg-brand-darkest rounded-2xl px-4 py-2.5 flex items-end">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje"
            rows={1}
            disabled={mutation.isPending}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 resize-none focus:outline-none min-h-[22px] max-h-[140px] leading-[22px]"
          />
        </div>

        {/* Send button */}
        <button
          onClick={() => { if (canSend) mutation.mutate() }}
          disabled={!canSend}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
            canSend
              ? 'bg-brand-wine hover:bg-brand-wine/80 shadow-md shadow-brand-wine/30'
              : 'bg-white/8 opacity-50'
          }`}
        >
          {mutation.isPending
            ? <Loader2 className="h-4 w-4 text-white animate-spin" />
            : <Send className="h-4 w-4 text-white" />}
        </button>
      </div>

      {/* Delay active hint inside bar */}
      {hasDelay && !showDelay && (
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="text-[10px] text-amber-400/80">
            ⏱ Envío con {formatDelay(delayMs)} de delay
          </span>
          <button
            onClick={() => setDelayMs(0)}
            className="text-[10px] text-white/30 hover:text-red-400 transition-colors"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}
