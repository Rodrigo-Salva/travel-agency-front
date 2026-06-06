'use client'

import { use, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeft, CalendarDays, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, DollarSign, User, Package, Plane, Hotel, RotateCcw, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { BookingStatus, PaymentStatus } from '@/features/bookings/types/booking.types'

const STATUS_CONFIG: Record<BookingStatus, { label: string; classes: string; icon: typeof CheckCircle2; next: BookingStatus[] }> = {
  pending:   { label: 'Pendiente',  classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       icon: Clock,         next: ['confirmed', 'cancelled'] },
  confirmed: { label: 'Confirmada', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2,  next: ['completed', 'cancelled'] },
  cancelled: { label: 'Cancelada',  classes: 'bg-red-500/10 text-red-400 border-red-500/20',             icon: XCircle,       next: [] },
  completed: { label: 'Completada', classes: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20', icon: CheckCircle2, next: [] },
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; dot: string }> = {
  unpaid:   { label: 'No pagado',    dot: 'bg-red-400' },
  partial:  { label: 'Pago parcial', dot: 'bg-amber-400' },
  paid:     { label: 'Pagado',       dot: 'bg-emerald-400' },
  refunded: { label: 'Reembolsado',  dot: 'bg-brand-steel' },
}

const PASSENGER_TYPE: Record<string, string> = { adult: 'Adulto', child: 'Niño', infant: 'Infante' }
const STATUS_LABELS: Record<BookingStatus, string> = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' }
const PAYMENT_LABELS: Record<PaymentStatus, string> = { unpaid: 'No pagado', partial: 'Parcial', paid: 'Pagado', refunded: 'Reembolsado' }

interface AdminBookingDetail {
  id: number
  booking_number: string
  status: BookingStatus
  payment_status: PaymentStatus
  booking_date: string
  travel_date: string | null
  return_date: string | null
  num_adults: number
  num_children: number
  num_infants: number
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  special_requests: string | null
  updated_at: string
  customer: number | { id: number; email: string; first_name: string; last_name: string; phone?: string }
  package: number | { id: number; name: string }
  passengers: { passenger_type: string; title?: string; first_name: string; last_name: string; passport_number?: string; nationality?: string }[]
  hotel_bookings: { id: number; hotel: number; check_in_date: string; check_out_date: string; total_price: string }[]
  flight_bookings: { id: number; flight: number; num_passengers: number; total_price: string; pnr_number?: string }[]
}

function RefundModal({ booking, onClose, onSuccess }: {
  booking: AdminBookingDetail
  onClose: () => void
  onSuccess: () => void
}) {
  const [amount, setAmount] = useState(booking.paid_amount)
  const [reason, setReason] = useState('')
  const maxAmount = parseFloat(booking.paid_amount)

  const mutation = useMutation({
    mutationFn: () => apiClient.post(API.refundBooking(booking.id), {
      refund_amount: parseFloat(amount),
      reason,
    }),
    onSuccess: () => {
      toast.success('Reembolso registrado correctamente')
      onSuccess()
      onClose()
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje
      toast.error(msg ?? 'Error al procesar el reembolso')
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Procesar reembolso</h2>
            <p className="text-brand-steel text-xs mt-0.5">Reserva #{booking.booking_number}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 p-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-brand-steel">Total pagado</span>
            <span className="text-emerald-400 font-semibold">{formatPrice(booking.paid_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-steel">Monto total reserva</span>
            <span className="text-white">{formatPrice(booking.total_amount)}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-brand-silver text-xs font-medium">Monto a reembolsar (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full rounded-xl bg-brand-darkest border border-brand-steel/20 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-wine"
          />
          <p className="text-xs text-brand-steel">Máximo: {formatPrice(booking.paid_amount)}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-brand-silver text-xs font-medium">Motivo (opcional)</label>
          <textarea
            rows={2}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ej: Cancelación por fuerza mayor, cliente solicitó..."
            className="w-full rounded-xl bg-brand-darkest border border-brand-steel/20 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-brand-wine resize-none placeholder:text-brand-steel"
          />
        </div>

        <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-3 text-xs text-amber-400">
          ⚠️ Esto marcará la reserva como <strong>Reembolsada</strong> y liberará el cupo. Esta acción no puede deshacerse.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !amount || parseFloat(amount) <= 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Confirmar reembolso
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const id = Number(params.id)

  const [showRefund, setShowRefund] = useState(false)

  const { data: booking, isLoading, isError } = useQuery<AdminBookingDetail>({
    queryKey: ['admin-booking', id],
    queryFn: async () => {
      const { data } = await apiClient.get(API.booking(id))
      return data.reserva ?? data
    },
    staleTime: 60 * 1000,
  })

  const updateStatus = useMutation({
    mutationFn: (newStatus: BookingStatus) => apiClient.patch(API.booking(id), { status: newStatus }),
    onSuccess: () => {
      toast.success('Estado actualizado')
      qc.invalidateQueries({ queryKey: ['admin-booking', id] })
    },
    onError: () => toast.error('Error al actualizar estado'),
  })

  const updatePayment = useMutation({
    mutationFn: (newStatus: PaymentStatus) => apiClient.patch(API.booking(id), { payment_status: newStatus }),
    onSuccess: () => {
      toast.success('Estado de pago actualizado')
      qc.invalidateQueries({ queryKey: ['admin-booking', id] })
    },
    onError: () => toast.error('Error al actualizar pago'),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
    </div>
  )

  if (isError || !booking) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-white font-semibold">Reserva no encontrada</p>
      <Link href={ROUTES.admin.bookings} className="text-brand-silver hover:text-white text-sm transition-colors">
        Volver a reservas
      </Link>
    </div>
  )

  const st = STATUS_CONFIG[booking.status]
  const py = PAYMENT_CONFIG[booking.payment_status]
  const StatusIcon = st.icon
  const customer = typeof booking.customer === 'object' ? booking.customer : null
  const pkg = typeof booking.package === 'object' ? booking.package : null

  const initials = customer
    ? `${customer.first_name[0] ?? ''}${customer.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  const canRefund = booking?.payment_status === 'paid' || booking?.payment_status === 'partial'

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {showRefund && booking && (
        <RefundModal
          booking={booking}
          onClose={() => setShowRefund(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['admin-booking', id] })}
        />
      )}

      {/* ── Header ── */}
      <div>
        <button
          onClick={() => router.push(ROUTES.admin.bookings)}
          className="flex items-center gap-1.5 text-brand-steel hover:text-white text-xs font-medium mb-4 transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Volver a reservas
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs text-brand-steel/60 mb-1 tracking-widest">#{booking.booking_number}</p>
            <h1 className="font-display text-2xl font-bold text-white">Detalle de reserva</h1>
            <p className="text-brand-steel text-sm mt-1">Creada el {formatDate(booking.booking_date)}</p>
          </div>
          <span className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border ${st.classes}`}>
            <StatusIcon className="h-4 w-4" />
            {st.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Columna izquierda ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Cliente */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                <User className="h-4 w-4 text-brand-rose" />
              </div>
              <h2 className="font-semibold text-white">Cliente</h2>
            </div>
            {customer ? (
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-wine to-brand-rose flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base">{customer.first_name} {customer.last_name}</p>
                  <p className="text-brand-steel text-sm mt-0.5">{customer.email}</p>
                  {customer.phone && <p className="text-brand-steel/60 text-xs mt-0.5">{customer.phone}</p>}
                </div>
              </div>
            ) : (
              <p className="px-5 py-4 text-brand-steel text-sm">Cliente #{booking.customer as number}</p>
            )}
          </div>

          {/* Paquete + fechas */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-brand-rose" />
              </div>
              <h2 className="font-semibold text-white">Paquete y viaje</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {pkg && (
                <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 px-4 py-3">
                  <p className="text-brand-steel text-xs uppercase tracking-widest mb-1">Paquete</p>
                  <p className="text-white font-semibold text-base">{pkg.name}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {booking.travel_date && (
                  <div className="rounded-xl bg-brand-darkest/40 border border-brand-steel/10 px-4 py-3">
                    <p className="text-brand-steel text-xs uppercase tracking-widest mb-1.5">Salida</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-brand-wine flex-shrink-0" />
                      <p className="text-white font-medium text-sm">{formatDate(booking.travel_date)}</p>
                    </div>
                  </div>
                )}
                {booking.return_date && (
                  <div className="rounded-xl bg-brand-darkest/40 border border-brand-steel/10 px-4 py-3">
                    <p className="text-brand-steel text-xs uppercase tracking-widest mb-1.5">Regreso</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-brand-steel flex-shrink-0" />
                      <p className="text-white font-medium text-sm">{formatDate(booking.return_date)}</p>
                    </div>
                  </div>
                )}
                <div className="rounded-xl bg-brand-darkest/40 border border-brand-steel/10 px-4 py-3">
                  <p className="text-brand-steel text-xs uppercase tracking-widest mb-1.5">Pasajeros</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-steel flex-shrink-0" />
                    <p className="text-white font-medium text-sm">
                      {booking.num_adults} adulto{booking.num_adults !== 1 ? 's' : ''}
                      {booking.num_children > 0 ? `, ${booking.num_children} niño${booking.num_children !== 1 ? 's' : ''}` : ''}
                      {booking.num_infants > 0 ? `, ${booking.num_infants} infante${booking.num_infants !== 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                </div>
              </div>
              {booking.special_requests && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-3">
                  <p className="text-amber-400/70 text-xs uppercase tracking-widest mb-1">Solicitudes especiales</p>
                  <p className="text-amber-200 text-sm">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pasajeros */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
                <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-brand-rose" />
                </div>
                <h2 className="font-semibold text-white">Pasajeros</h2>
                <span className="ml-auto text-xs font-medium text-brand-steel bg-brand-steel/10 px-2 py-0.5 rounded-full">
                  {booking.passengers.length}
                </span>
              </div>
              <div className="divide-y divide-brand-steel/10">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-brand-steel/10 flex items-center justify-center flex-shrink-0 text-brand-silver text-xs font-bold">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{p.title ? `${p.title} ` : ''}{p.first_name} {p.last_name}</p>
                      <p className="text-brand-steel text-xs">
                        {PASSENGER_TYPE[p.passenger_type] ?? p.passenger_type}
                        {p.nationality ? ` · ${p.nationality}` : ''}
                      </p>
                    </div>
                    {p.passport_number && (
                      <p className="text-brand-steel/60 text-xs font-mono bg-brand-darkest px-2 py-1 rounded-md">{p.passport_number}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel bookings */}
          {booking.hotel_bookings && booking.hotel_bookings.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
                <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                  <Hotel className="h-4 w-4 text-brand-rose" />
                </div>
                <h2 className="font-semibold text-white">Hoteles</h2>
              </div>
              <div className="divide-y divide-brand-steel/10">
                {booking.hotel_bookings.map((h) => (
                  <div key={h.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-white font-medium text-sm">Hotel #{h.hotel}</p>
                      <p className="text-brand-steel text-xs mt-0.5">{formatDate(h.check_in_date)} → {formatDate(h.check_out_date)}</p>
                    </div>
                    <p className="text-white font-semibold">{formatPrice(h.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flight bookings */}
          {booking.flight_bookings && booking.flight_bookings.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
                <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                  <Plane className="h-4 w-4 text-brand-rose" />
                </div>
                <h2 className="font-semibold text-white">Vuelos</h2>
              </div>
              <div className="divide-y divide-brand-steel/10">
                {booking.flight_bookings.map((f) => (
                  <div key={f.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-white font-medium text-sm">Vuelo #{f.flight}</p>
                      <p className="text-brand-steel text-xs mt-0.5">
                        {f.num_passengers} pasajero{f.num_passengers !== 1 ? 's' : ''}
                        {f.pnr_number ? ` · PNR: ${f.pnr_number}` : ''}
                      </p>
                    </div>
                    <p className="text-white font-semibold">{formatPrice(f.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar derecha ── */}
        <div className="space-y-4">

          {/* Resumen de pago */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-steel/10">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-brand-rose" />
              </div>
              <h2 className="font-semibold text-white">Resumen de pago</h2>
            </div>

            {/* Total destacado */}
            <div className="px-5 py-4 bg-gradient-to-br from-brand-wine/10 to-transparent border-b border-brand-steel/10">
              <p className="text-brand-steel text-xs uppercase tracking-widest mb-1">Total de la reserva</p>
              <p className="font-display text-3xl font-bold text-white">{formatPrice(booking.total_amount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${py.dot}`} />
                <span className="text-sm font-medium" style={{ color: py.dot.includes('emerald') ? '#34d399' : py.dot.includes('amber') ? '#fbbf24' : py.dot.includes('red') ? '#f87171' : '#94a3b8' }}>
                  {py.label}
                </span>
              </div>
            </div>

            {/* Desglose */}
            <div className="px-5 py-4 space-y-2.5 text-sm border-b border-brand-steel/10">
              <div className="flex justify-between">
                <span className="text-brand-steel">Subtotal</span>
                <span className="text-white">{formatPrice(booking.subtotal)}</span>
              </div>
              {parseFloat(booking.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-400">Descuento</span>
                  <span className="text-emerald-400">− {formatPrice(booking.discount_amount)}</span>
                </div>
              )}
              {parseFloat(booking.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-steel">Impuestos</span>
                  <span className="text-white">{formatPrice(booking.tax_amount)}</span>
                </div>
              )}
              {parseFloat(booking.paid_amount) > 0 && (
                <div className="flex justify-between pt-2 border-t border-brand-steel/10">
                  <span className="text-emerald-400">Pagado</span>
                  <span className="text-emerald-400 font-semibold">{formatPrice(booking.paid_amount)}</span>
                </div>
              )}
            </div>

            {/* Cambiar pago */}
            <div className="px-5 py-4">
              <p className="text-xs text-brand-steel uppercase tracking-widest mb-2.5">Cambiar estado de pago</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(['unpaid', 'partial', 'paid', 'refunded'] as PaymentStatus[])
                  .filter(s => s !== booking.payment_status)
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => updatePayment.mutate(s)}
                      disabled={updatePayment.isPending}
                      className="px-2 py-2 rounded-lg border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-wine/40 hover:bg-brand-wine/5 text-xs font-medium transition-all disabled:opacity-40"
                    >
                      {PAYMENT_LABELS[s]}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Reembolso */}
          {canRefund && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-steel/10 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-brand-rose" />
                <h2 className="font-semibold text-white text-sm">Reembolso</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-brand-steel text-xs mb-3">Pagado: <span className="text-emerald-400 font-semibold">{formatPrice(booking.paid_amount)}</span></p>
                <button
                  onClick={() => setShowRefund(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm font-semibold transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Procesar reembolso
                </button>
              </div>
            </div>
          )}

          {/* Cambiar estado */}
          {st.next.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-steel/10">
                <p className="text-xs text-brand-steel uppercase tracking-widest">Cambiar estado</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                {st.next.map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const Icon = cfg.icon
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus.mutate(s)}
                      disabled={updateStatus.isPending}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.98] ${cfg.classes}`}
                    >
                      {updateStatus.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Icon className="h-4 w-4" />}
                      {STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 px-5 py-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-steel">Creada</span>
              <span className="text-white">{formatDate(booking.booking_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-steel">Actualizada</span>
              <span className="text-white">{formatDate(booking.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
