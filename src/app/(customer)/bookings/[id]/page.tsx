'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeft, CalendarDays, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, MapPin, DollarSign, FileText, User, Printer
} from 'lucide-react'
import { toast } from 'sonner'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { BookingStatus, PaymentStatus } from '@/features/bookings/types/booking.types'

const STATUS_CONFIG: Record<BookingStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  pending:   { label: 'Pendiente',  classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       icon: Clock },
  confirmed: { label: 'Confirmada', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada',  classes: 'bg-red-500/10 text-red-400 border-red-500/20',             icon: XCircle },
  completed: { label: 'Completada', classes: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20', icon: CheckCircle2 },
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; dot: string }> = {
  unpaid:   { label: 'No pagado',    dot: 'bg-red-400' },
  partial:  { label: 'Pago parcial', dot: 'bg-amber-400' },
  paid:     { label: 'Pagado',       dot: 'bg-emerald-400' },
  refunded: { label: 'Reembolsado',  dot: 'bg-brand-steel' },
}

const PASSENGER_TYPE: Record<string, string> = {
  adult: 'Adulto', child: 'Niño', infant: 'Infante'
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', Number(id)],
    queryFn: () => bookingsApi.get(Number(id)),
    staleTime: 2 * 60 * 1000,
  })

  const cancel = useMutation({
    mutationFn: () => bookingsApi.cancel(Number(id)),
    onSuccess: (data) => {
      toast.success(data.mensaje)
      qc.invalidateQueries({ queryKey: ['booking', Number(id)] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setConfirming(false)
    },
    onError: () => toast.error('No se pudo cancelar la reserva'),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
    </div>
  )

  if (isError || !booking) return (
    <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-white font-semibold">No se encontró la reserva</p>
      <Link href={ROUTES.customer.bookings} className="text-brand-silver hover:text-white text-sm transition-colors">
        Volver a mis reservas
      </Link>
    </div>
  )

  const st = STATUS_CONFIG[booking.status]
  const py = PAYMENT_CONFIG[booking.payment_status]
  const StatusIcon = st.icon
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <Link href={ROUTES.customer.bookings} className="inline-flex items-center gap-1 text-brand-silver hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Mis reservas
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-brand-steel text-xs font-mono mb-1">#{booking.booking_number}</p>
              <h1 className="font-display text-3xl font-bold text-white">Detalle de reserva</h1>
              <p className="text-brand-steel text-sm mt-1">Reservado el {formatDate(booking.booking_date)}</p>
            </div>
            <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${st.classes}`}>
              <StatusIcon className="h-4 w-4" />{st.label}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          nav, header, footer, .print-hide { display: none !important; }
          body { background: white !important; color: #111 !important; }
          .bg-brand-darkest, .bg-brand-dark { background: white !important; }
          .text-white { color: #111 !important; }
          .text-brand-silver { color: #444 !important; }
          .text-brand-steel { color: #666 !important; }
          .border-brand-steel\\/10 { border-color: #ddd !important; }
          .rounded-2xl, .rounded-xl { border: 1px solid #ddd; }
        }
      `}</style>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">

        {/* Resumen de viaje */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-wine" /> Detalles del viaje
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {booking.travel_date && (
              <div>
                <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Salida</p>
                <p className="text-white font-medium">{formatDate(booking.travel_date)}</p>
              </div>
            )}
            {booking.return_date && (
              <div>
                <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Regreso</p>
                <p className="text-white font-medium">{formatDate(booking.return_date)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Pasajeros</p>
              <p className="text-white font-medium">
                {booking.num_adults} adulto{booking.num_adults !== 1 ? 's' : ''}
                {booking.num_children > 0 && `, ${booking.num_children} niño${booking.num_children !== 1 ? 's' : ''}`}
                {booking.num_infants > 0 && `, ${booking.num_infants} infante${booking.num_infants !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Pago</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${py.dot}`} />
                <p className="text-white font-medium">{py.label}</p>
              </div>
            </div>
          </div>
          {booking.special_requests && (
            <div className="mt-5 pt-5 border-t border-brand-steel/10">
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Solicitudes especiales</p>
              <p className="text-brand-silver text-sm">{booking.special_requests}</p>
            </div>
          )}
        </div>

        {/* Pasajeros */}
        {booking.passengers && booking.passengers.length > 0 && (
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
            <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-wine" /> Pasajeros ({booking.passengers.length})
            </h2>
            <div className="space-y-3">
              {booking.passengers.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10">
                  <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-brand-rose" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{p.first_name} {p.last_name}</p>
                    <p className="text-brand-steel text-xs">{PASSENGER_TYPE[p.passenger_type] ?? p.passenger_type}</p>
                  </div>
                  {p.passport_number && (
                    <p className="text-brand-steel text-xs font-mono">Pasaporte: {p.passport_number}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen financiero */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-brand-wine" /> Resumen de pago
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-silver">Subtotal</span>
              <span className="text-white">{formatPrice(booking.subtotal)}</span>
            </div>
            {parseFloat(booking.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Descuento</span>
                <span>− {formatPrice(booking.discount_amount)}</span>
              </div>
            )}
            {parseFloat(booking.tax_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-brand-silver">Impuestos</span>
                <span className="text-white">{formatPrice(booking.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-brand-steel/10">
              <span className="font-semibold text-white">Total</span>
              <span className="font-display text-xl font-bold text-white">{formatPrice(booking.total_amount)}</span>
            </div>
            {parseFloat(booking.paid_amount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Pagado</span>
                <span>{formatPrice(booking.paid_amount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Factura */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 print-hide">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Printer className="h-4 w-4 text-brand-wine" /> Factura
          </h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine/10 border border-brand-wine/20 text-brand-rose text-sm font-medium hover:bg-brand-wine hover:text-white transition-colors"
          >
            <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
          </button>
          <p className="text-xs text-brand-steel mt-2">En el diálogo de impresión elige "Guardar como PDF" para descargar.</p>
        </div>

        {/* Acciones */}
        {canCancel && (
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-wine" /> Acciones
            </h2>
            {confirming ? (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-brand-silver text-sm">¿Confirmas la cancelación?</p>
                <button
                  onClick={() => cancel.mutate()}
                  disabled={cancel.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {cancel.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Sí, cancelar
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white transition-colors"
                >
                  No, mantener
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                <XCircle className="h-4 w-4" /> Cancelar reserva
              </button>
            )}
          </div>
        )}

        {/* CTA reseña */}
        {booking.status === 'completed' && (
          <div className="rounded-2xl bg-gradient-to-r from-brand-wine/10 to-brand-dark border border-brand-wine/20 p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white font-semibold">¿Cómo fue tu experiencia?</p>
              <p className="text-brand-silver text-sm">Ayuda a otros viajeros con tu opinión.</p>
            </div>
            <Link
              href={`${ROUTES.customer.newReview}?booking=${booking.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              Escribir reseña
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
