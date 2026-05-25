'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell, CheckCheck, Calendar, CreditCard, MessageSquare,
  Star, Loader2, ArrowLeft, Inbox,
} from 'lucide-react'
import { toast } from 'sonner'
import { notificationsApi, type AppNotification } from '@/features/notifications/notifications.api'
import { formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

const NOTIF_CONFIG: Record<AppNotification['type'], {
  icon: typeof Bell
  label: string
  dot: string
  bg: string
  iconColor: string
}> = {
  booking:  { icon: Calendar,      label: 'Reserva',       dot: 'bg-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    iconColor: 'text-blue-400' },
  payment:  { icon: CreditCard,     label: 'Pago',          dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', iconColor: 'text-emerald-400' },
  review:   { icon: MessageSquare,  label: 'Reseña',        dot: 'bg-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-400' },
  promo:    { icon: Star,           label: 'Promoción',     dot: 'bg-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   iconColor: 'text-amber-400' },
  system:   { icon: Bell,           label: 'Sistema',       dot: 'bg-brand-steel', bg: 'bg-brand-steel/10 border-brand-steel/20', iconColor: 'text-brand-steel' },
}

function NotificationItem({ n, onMarkRead }: { n: AppNotification; onMarkRead: (id: number) => void }) {
  const cfg = NOTIF_CONFIG[n.type] ?? NOTIF_CONFIG.system
  const Icon = cfg.icon

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
      n.is_read
        ? 'bg-brand-dark border-brand-steel/10'
        : 'bg-brand-dark border-brand-wine/20 shadow-sm shadow-brand-wine/5'
    }`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${n.is_read ? 'bg-brand-steel/10 border-brand-steel/20' : cfg.bg}`}>
        <Icon className={`h-4 w-4 ${n.is_read ? 'text-brand-steel' : cfg.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${n.is_read ? 'text-brand-steel bg-brand-steel/10 border-brand-steel/20' : cfg.bg + ' ' + cfg.iconColor}`}>
                {cfg.label}
              </span>
              {!n.is_read && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
            </div>
            <p className={`text-sm font-semibold ${n.is_read ? 'text-brand-silver' : 'text-white'}`}>
              {n.title}
            </p>
            <p className="text-sm text-brand-steel mt-0.5 leading-relaxed">{n.message}</p>
          </div>
          <p className="text-xs text-brand-steel/60 flex-shrink-0 mt-1">{formatDate(n.created_at)}</p>
        </div>

        <div className="flex items-center gap-3 mt-3">
          {n.link && (
            <Link
              href={n.link}
              className="text-xs text-brand-rose hover:text-white font-medium transition-colors"
            >
              Ver detalle →
            </Link>
          )}
          {!n.is_read && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="text-xs text-brand-steel hover:text-brand-silver transition-colors"
            >
              Marcar como leída
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })

  const markOne = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast.error('No se pudo marcar la notificación'),
  })

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Todas las notificaciones marcadas como leídas')
    },
    onError: () => toast.error('No se pudo marcar las notificaciones'),
  })

  const notifications = data?.notifications ?? []
  const unread = data?.unread ?? 0
  const unreadItems = notifications.filter(n => !n.is_read)
  const readItems = notifications.filter(n => n.is_read)

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <Link href={ROUTES.customer.dashboard} className="inline-flex items-center gap-1.5 text-brand-silver hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver al dashboard
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-brand-wine text-xs font-bold uppercase tracking-widest mb-1">Mi cuenta</p>
              <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
                <Bell className="h-7 w-7 text-brand-wine" />
                Notificaciones
                {unread > 0 && (
                  <span className="text-base font-semibold px-2.5 py-0.5 rounded-full bg-brand-wine text-white">
                    {unread} nueva{unread !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
            </div>
            {unread > 0 && !markAll.isPending && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white hover:bg-brand-steel/10 transition-colors disabled:opacity-50"
              >
                {markAll.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCheck className="h-4 w-4" />
                }
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-brand-dark" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-dark border border-brand-steel/10 flex items-center justify-center">
              <Inbox className="h-10 w-10 text-brand-steel/40" />
            </div>
            <h2 className="text-xl font-bold text-white">Todo al día</h2>
            <p className="text-brand-silver max-w-sm">
              No tienes notificaciones por ahora. Las actualizaciones de tus reservas y pagos aparecerán aquí.
            </p>
            <Link
              href={ROUTES.customer.bookings}
              className="mt-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              Ver mis reservas
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unread */}
            {unreadItems.length > 0 && (
              <div>
                <p className="text-xs font-bold text-brand-wine uppercase tracking-widest mb-3">
                  Nuevas · {unreadItems.length}
                </p>
                <div className="space-y-3">
                  {unreadItems.map(n => (
                    <NotificationItem key={n.id} n={n} onMarkRead={id => markOne.mutate(id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Read */}
            {readItems.length > 0 && (
              <div>
                <p className="text-xs font-bold text-brand-steel uppercase tracking-widest mb-3">
                  Anteriores · {readItems.length}
                </p>
                <div className="space-y-3">
                  {readItems.map(n => (
                    <NotificationItem key={n.id} n={n} onMarkRead={id => markOne.mutate(id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
