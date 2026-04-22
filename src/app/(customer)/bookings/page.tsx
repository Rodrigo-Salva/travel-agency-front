'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { BookingStatus, PaymentStatus, BookingSummary } from '@/features/bookings/types/booking.types'
import { queryKeys } from '@/lib/query/keys'

const STATUS_CONFIG: Record<BookingStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  pending:   { label: 'Pendiente',  classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  confirmed: { label: 'Confirmada', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada',  classes: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  completed: { label: 'Completada', classes: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20', icon: CheckCircle2 },
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; classes: string }> = {
  unpaid:   { label: 'No pagado',   classes: 'text-red-400' },
  partial:  { label: 'Pago parcial', classes: 'text-amber-400' },
  paid:     { label: 'Pagado',       classes: 'text-emerald-400' },
  refunded: { label: 'Reembolsado', classes: 'text-brand-steel' },
}

function BookingCard({ booking }: { booking: BookingSummary }) {
  const [confirming, setConfirming] = useState(false)
  const qc = useQueryClient()

  const status = STATUS_CONFIG[booking.status]
  const payment = PAYMENT_CONFIG[booking.payment_status]
  const StatusIcon = status.icon

  const cancel = useMutation({
    mutationFn: () => bookingsApi.cancel(booking.id),
    onSuccess: (data) => {
      toast.success(data.mensaje)
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all })
    },
    onError: () => toast.error('No se pudo cancelar la reserva'),
    onSettled: () => setConfirming(false),
  })

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:border-brand-wine/20 transition-all">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-brand-steel/10 bg-brand-darkest/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-brand-steel">#{booking.booking_number}</span>
          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.classes}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>
        <Link href={ROUTES.customer.booking(booking.id)} className="text-xs text-brand-steel hover:text-brand-wine transition-colors">
          {formatDate(booking.booking_date)} →
        </Link>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {booking.travel_date && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-wine flex-shrink-0" />
              <div>
                <p className="text-xs text-brand-steel">Salida</p>
                <p className="text-white text-sm font-medium">{formatDate(booking.travel_date)}</p>
              </div>
            </div>
          )}
          {booking.return_date && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-steel flex-shrink-0" />
              <div>
                <p className="text-xs text-brand-steel">Regreso</p>
                <p className="text-white text-sm font-medium">{formatDate(booking.return_date)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-steel flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-steel">Pasajeros</p>
              <p className="text-white text-sm font-medium">
                {booking.num_adults}A
                {booking.num_children > 0 ? ` · ${booking.num_children}N` : ''}
                {booking.num_infants > 0 ? ` · ${booking.num_infants}I` : ''}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-brand-steel">Total</p>
            <p className="font-display text-lg font-bold text-white">{formatPrice(booking.total_amount)}</p>
            <p className={`text-xs ${payment.classes}`}>{payment.label}</p>
          </div>
        </div>

        {/* Actions */}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <div className="pt-4 border-t border-brand-steel/10">
            {confirming ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-brand-silver">¿Seguro que quieres cancelar?</p>
                <button
                  onClick={() => cancel.mutate()}
                  disabled={cancel.isPending}
                  className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {cancel.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Si, cancelar'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-4 py-1.5 rounded-lg border border-brand-steel/20 text-brand-silver text-xs font-medium hover:text-white transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-brand-steel hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancelar reserva
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: () => bookingsApi.list(),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-2">Mi cuenta</p>
              <h1 className="font-display text-4xl font-bold text-white">Mis reservas</h1>
            </div>
            <Link
              href={ROUTES.packages}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva reserva
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-brand-dark border border-brand-steel/10 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <Package className="h-16 w-16 text-brand-steel/40" />
            <h2 className="text-2xl font-bold text-white">Sin reservas aun</h2>
            <p className="text-brand-silver max-w-sm">
              Explora nuestros paquetes y reserva tu proximo viaje.
            </p>
            <Link
              href={ROUTES.packages}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              Ver paquetes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-brand-steel mb-6">
              {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} en total
            </p>
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
