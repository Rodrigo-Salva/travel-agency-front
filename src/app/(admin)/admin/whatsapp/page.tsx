'use client'

import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Users, BarChart2, Loader2, Wifi, WifiOff, Phone, Trash2, Plus, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ConversationList } from '@/components/whatsapp/ConversationList'
import { ChatWindow } from '@/components/whatsapp/ChatWindow'
import { MessageInput } from '@/components/whatsapp/MessageInput'
import { SessionManager } from '@/components/whatsapp/SessionManager'
import { useWhatsAppSocket } from '@/hooks/useWhatsApp'
import { whatsappApi, type WAConversation } from '@/lib/api/whatsapp'

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-purple-600',
  'bg-amber-600',   'bg-rose-600',  'bg-cyan-600',
]
function avatarColor(phone: string): string {
  let hash = 0
  for (const c of phone) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function cleanPhone(phone: string): string {
  return phone.replace(/@.*/, '')
}

export default function WhatsAppAdminPage() {
  const [activeConversation, setActiveConversation] = useState<WAConversation | null>(null)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const queryClient = useQueryClient()

  const clearMutation = useMutation({
    mutationFn: () => whatsappApi.clearChat(activeConversation!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', activeConversation?.id] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'conversations'] })
      setShowClearConfirm(false)
      toast.success('Chat vaciado')
    },
    onError: () => toast.error('Error al vaciar el chat'),
  })

  useWhatsAppSocket()

  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ['whatsapp', 'session'],
    queryFn: whatsappApi.getSessionStatus,
    refetchInterval: 5000,
  })

  const isConnected = session?.status === 'WORKING'

  const { data: conversations = [], isLoading: loadingConvs } = useQuery({
    queryKey: ['whatsapp', 'conversations'],
    queryFn: whatsappApi.getConversations,
    enabled: isConnected,
    refetchInterval: 15000,
  })

  const { data: messages = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ['whatsapp', 'messages', activeConversation?.id],
    queryFn: () => whatsappApi.getMessages(activeConversation!.id),
    enabled: !!activeConversation && isConnected,
    refetchInterval: 10000,
  })

  const handleConnected = useCallback(() => {}, [])

  const totalUnread = conversations.reduce((acc: number, c: WAConversation) => acc + c.unread_count, 0)
  const contact = activeConversation?.contact
  const contactName = contact?.name || cleanPhone(contact?.phone ?? '')
  const contactInitial = contactName.charAt(0).toUpperCase()
  const contactColor = contact ? avatarColor(contact.phone) : 'bg-brand-steel'

  const H = 'flex items-center gap-2 px-4 h-14 bg-brand-dark border-b border-brand-steel/10 shrink-0'

  return (
    <div className="flex h-screen bg-brand-darkest overflow-hidden">

      {/* ── Panel izquierdo ── */}
      <aside className="w-72 shrink-0 border-r border-brand-steel/10 flex flex-col overflow-hidden">

        {/* Header izquierdo */}
        <div className={H}>
          <MessageCircle className="h-4 w-4 text-brand-rose shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-white text-sm leading-tight">Conversaciones</span>
            {isConnected && session?.me?.id && (
              <span className="text-[10px] text-brand-rose/50 truncate">
                {session.me.pushName || cleanPhone(session.me.id)}
              </span>
            )}
          </div>
          {totalUnread > 0 && (
            <span className="bg-brand-wine text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none shrink-0">
              {totalUnread}
            </span>
          )}
          {/* Status indicator */}
          <div className={`flex items-center gap-1 shrink-0 ${
            isConnected ? 'text-brand-rose' : 'text-brand-steel/30'
          }`}>
            {loadingSession
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : isConnected
                ? <Wifi className="h-3 w-3" />
                : <WifiOff className="h-3 w-3" />}
          </div>
          {isConnected && (
            <>
              <button
                onClick={() => setShowNewConversation(true)}
                title="Nuevo mensaje"
                className="text-brand-steel/40 hover:text-brand-rose transition-colors p-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowLogout(true)}
                title="Cerrar sesión de WhatsApp"
                className="text-brand-steel/30 hover:text-red-400 transition-colors p-1 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Contenido izquierdo */}
        {!isConnected ? (
          <SessionManager onConnected={handleConnected} />
        ) : loadingConvs ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-5 w-5 text-brand-steel animate-spin" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id ?? null}
            onSelect={setActiveConversation}
            connectedPhone={session?.me?.id ?? ''}
            connectedName={session?.me?.pushName ?? ''}
            showNewModal={showNewConversation}
            onOpenNew={() => setShowNewConversation(true)}
            onCloseNewModal={() => setShowNewConversation(false)}
            showLogoutModal={showLogout}
            onCloseLogoutModal={() => setShowLogout(false)}
          />
        )}
      </aside>

      {/* ── Panel derecho ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header derecho — mismo H que el izquierdo */}
        <div className={H}>
          {!isConnected ? (
            <>
              <WifiOff className="h-4 w-4 text-brand-steel/40 shrink-0" />
              <span className="text-brand-steel/40 text-sm flex-1">Sin conexión</span>
            </>
          ) : activeConversation ? (
            <>
              <div className={`w-7 h-7 rounded-full ${contactColor} flex items-center justify-center text-white font-semibold text-xs shrink-0`}>
                {contactInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm leading-tight truncate">{contactName}</p>
                <p className="text-[10px] text-brand-steel/50 truncate flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5 shrink-0" />
                  {cleanPhone(contact?.phone ?? '')}
                </p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                title="Vaciar chat"
                className="text-brand-steel/30 hover:text-red-400 transition-colors p-1 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 text-brand-steel/30 shrink-0" />
              <span className="text-brand-steel/30 text-sm flex-1">Selecciona una conversación</span>
            </>
          )}

          {/* Acciones globales siempre visibles */}
          <Link
            href="/admin/whatsapp/campaigns"
            className="flex items-center gap-1 text-xs text-brand-steel/50 hover:text-brand-steel transition-colors px-2 py-1 rounded-lg hover:bg-brand-steel/5 shrink-0"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Campañas</span>
          </Link>
          <a
            href="http://localhost:3005/admin/queues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brand-steel/50 hover:text-brand-steel transition-colors px-2 py-1 rounded-lg hover:bg-brand-steel/5 shrink-0"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Cola</span>
          </a>
        </div>

        {/* Contenido derecho */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-brand-steel/20">
            <WifiOff className="h-12 w-12" />
            <p className="text-sm">Conecta tu número para chatear</p>
          </div>
        ) : activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto bg-brand-darkest">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 text-brand-steel animate-spin" />
                </div>
              ) : (
                <ChatWindow messages={messages} conversationId={activeConversation.id} />
              )}
            </div>
            <MessageInput
              chatId={activeConversation.contact.phone}
              conversationId={activeConversation.id}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-brand-steel/20">
            <div className="w-20 h-20 rounded-full bg-brand-steel/5 flex items-center justify-center">
              <MessageCircle className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-brand-steel/30 font-medium text-sm">WhatsApp</p>
              <p className="text-xs">Selecciona una conversación o crea una nueva</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal confirmación vaciar chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-brand-dark rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Vaciar chat</p>
                <p className="text-xs text-brand-steel/60 mt-0.5">
                  Se eliminarán todos los mensajes de esta conversación. No se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-brand-steel text-sm hover:border-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {clearMutation.isPending ? 'Vaciando...' : 'Vaciar chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
