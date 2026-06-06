import { Clock, Send, CheckCheck, Eye, XCircle, Ban } from 'lucide-react'
import type { WAMessage } from '@/lib/api/whatsapp'

const STATUS_CONFIG: Record<WAMessage['status'], { icon: React.ReactNode; color: string; label: string }> = {
  pending:   { icon: <Clock className="h-3 w-3" />,      color: 'text-brand-steel/50', label: 'Pendiente' },
  queued:    { icon: <Clock className="h-3 w-3" />,      color: 'text-amber-400',       label: 'En cola' },
  sent:      { icon: <Send className="h-3 w-3" />,       color: 'text-blue-400',        label: 'Enviado' },
  delivered: { icon: <CheckCheck className="h-3 w-3" />, color: 'text-blue-400',        label: 'Entregado' },
  read:      { icon: <CheckCheck className="h-3 w-3" />, color: 'text-emerald-400',     label: 'Leído' },
  failed:    { icon: <XCircle className="h-3 w-3" />,    color: 'text-red-400',         label: 'Fallido' },
  cancelled: { icon: <Ban className="h-3 w-3" />,        color: 'text-brand-steel/50',  label: 'Cancelado' },
}

export function MessageStatus({ status }: { status: WAMessage['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1 ${cfg.color}`} title={cfg.label}>
      {cfg.icon}
    </span>
  )
}
