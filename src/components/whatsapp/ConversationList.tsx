'use client'

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Plus, X, LogOut } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { whatsappApi, type WAConversation } from '@/lib/api/whatsapp'

interface Props {
  conversations: WAConversation[]
  activeId: number | null
  onSelect: (conv: WAConversation) => void
  connectedPhone?: string
  connectedName?: string
  showNewModal?: boolean
  onOpenNew?: () => void
  onCloseNewModal?: () => void
  showLogoutModal?: boolean
  onCloseLogoutModal?: () => void
}

function getInitials(name: string, phone: string): string {
  if (name) return name.charAt(0).toUpperCase()
  const clean = phone.replace(/@.*/, '').replace(/\D/g, '')
  return clean.charAt(clean.length - 1) || '?'
}

function cleanPhone(phone: string | undefined): string {
  return (phone ?? '').replace(/@.*/, '')
}

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-purple-600',
  'bg-amber-600',  'bg-rose-600',  'bg-cyan-600',
]
function avatarColor(phone: string): string {
  let hash = 0
  for (const c of phone) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function NewConversationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (conv: WAConversation) => void }) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const sendMutation = useMutation({
    mutationFn: () => {
      // Format phone: strip spaces/dashes, prepend 51 if local Peruvian number
      let formatted = phone.replace(/\D/g, '')
      if (formatted.length === 9) formatted = `51${formatted}`
      const chatId = `${formatted}@c.us`
      return whatsappApi.sendMessage(chatId, message, 0)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] })
      toast.success('Mensaje enviado')
      onClose()
    },
    onError: () => toast.error('No se pudo enviar el mensaje'),
  })

  return (
    <div className="absolute inset-0 z-20 bg-black/60 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-brand-dark rounded-t-2xl p-5 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Nuevo mensaje</h3>
          <button onClick={onClose} className="text-brand-steel hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-brand-steel mb-1 block">Número de teléfono</label>
            <input
              autoFocus
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="929148511 o 51929148511"
              className="w-full bg-brand-steel/5 border border-brand-steel/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-brand-steel/40 focus:outline-none focus:border-emerald-500/50"
            />
            <p className="text-[10px] text-brand-steel/40 mt-1">Solo Perú (+51). Ingresa 9 dígitos.</p>
          </div>
          <div>
            <label className="text-xs text-brand-steel mb-1 block">Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Escribe el mensaje..."
              rows={3}
              className="w-full bg-brand-steel/5 border border-brand-steel/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-brand-steel/40 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          <button
            onClick={() => sendMutation.mutate()}
            disabled={!phone.trim() || !message.trim() || sendMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-sm transition-colors"
          >
            {sendMutation.isPending ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConversationList({ conversations, activeId, onSelect, connectedPhone, connectedName, showNewModal = false, onOpenNew, onCloseNewModal, showLogoutModal = false, onCloseLogoutModal }: Props) {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: whatsappApi.logoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'session'] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] })
      toast.success('Sesión de WhatsApp cerrada')
      setShowLogoutConfirm(false)
    },
    onError: () => toast.error('Error al cerrar sesión'),
  })

  const filtered = conversations.filter(c => {
    if (!c.contact) return false
    const q = search.toLowerCase()
    return (
      c.contact.name?.toLowerCase().includes(q) ||
      cleanPhone(c.contact.phone ?? '').includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full relative">
      {/* Buscador */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-steel/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-brand-steel/5 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-brand-steel/40 focus:outline-none border border-transparent focus:border-brand-steel/20"
          />
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-brand-steel">
          <p className="text-xs">
            {search ? 'Sin resultados' : 'Sin conversaciones'}
          </p>
          {!search && (
            <button
              onClick={() => onOpenNew?.()}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Enviar primer mensaje
            </button>
          )}
        </div>
      ) : (
        <ul className="overflow-y-auto flex-1">
          {filtered.map((conv) => {
            const name = conv.contact.name || cleanPhone(conv.contact.phone)
            const initials = getInitials(conv.contact.name, conv.contact.phone)
            const color = avatarColor(conv.contact.phone)
            const isActive = activeId === conv.id
            const lastMsg = conv.last_message

            return (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv)}
                  className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-brand-steel/10'
                      : 'hover:bg-brand-steel/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`shrink-0 w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-semibold text-sm`}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-medium text-white text-sm truncate">{name}</span>
                      {conv.last_message_at && (
                        <span className={`shrink-0 text-[10px] ${conv.unread_count > 0 ? 'text-emerald-400' : 'text-brand-steel/50'}`}>
                          {formatDistanceToNow(new Date(conv.last_message_at), { locale: es, addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs text-brand-steel/60 truncate">
                        {lastMsg
                          ? `${lastMsg.direction === 'outgoing' ? '✓ ' : ''}${lastMsg.content}`
                          : cleanPhone(conv.contact.phone)}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="shrink-0 bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Modal nueva conversación */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => onCloseNewModal?.()}
          onCreated={(conv) => { onSelect(conv); onCloseNewModal?.() }}
        />
      )}

      {/* Confirmación de logout */}
      {showLogoutModal && (
        <div className="absolute inset-0 z-20 bg-black/60 flex items-end" onClick={() => onCloseLogoutModal?.()}>
          <div
            className="w-full bg-brand-dark rounded-t-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Cerrar sesión de WhatsApp</p>
                <p className="text-xs text-brand-steel/60 mt-0.5">
                  Se desconectará el número. Al volver a conectar con el mismo número, los mensajes seguirán ahí.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCloseLogoutModal?.()}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-brand-steel text-sm hover:border-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
