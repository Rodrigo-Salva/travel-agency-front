'use client'

import { use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeft, CalendarDays, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, DollarSign, User, Package, Plane, Hotel,
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

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const id = Number(params.id)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push(ROUTES.admin.bookings)}
            className="flex items-center gap-1 text-brand-silver hover:text-white text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Reservas
          </button>
          <p className="font-mono text-xs text-brand-steel mb-1">#{booking.booking_number}</p>
          <h1 className="font-display text-2xl font-bold text-white">Detalle de reserva</h1>
          <p className="text-brand-steel text-sm mt-1">Creada el {formatDate(booking.booking_date)}</p>
        </div>
        <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${st.classes}`}>
          <StatusIcon className="h-4 w-4" />{st.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-wine" /> Cliente
            </h2>
            {customer ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-steel">Nombre</span>
                  <span className="text-white font-medium">{customer.first_name} {customer.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-steel">Email</span>
                  <span className="text-white">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-brand-steel">Teléfono</span>
                    <span className="text-white">{customer.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-brand-steel text-sm">ID cliente: {booking.customer as number}</p>
            )}
          </div>

          {/* Package + travel */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-wine" /> Viaje
            </h2>
            {pkg && (
              <div className="mb-4 pb-4 border-b border-brand-steel/10">
                <p className="text-brand-steel text-xs">Paquete</p>
                <p className="text-white font-semibold">{pkg.name}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {booking.travel_date && (
                <div>
                  <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Salida</p>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand-wine" />
                    <p className="text-white font-medium">{formatDate(booking.travel_date)}</p>
                  </div>
                </div>
              )}
              {booking.return_date && (
                <div>
                  <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Regreso</p>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand-steel" />
                    <p className="text-white font-medium">{formatDate(booking.return_date)}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Pasajeros</p>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-steel" />
                  <p className="text-white font-medium">
                    {booking.num_adults}A
                    {booking.num_children > 0 ? ` · ${booking.num_children}N` : ''}
                    {booking.num_infants > 0 ? ` · ${booking.num_infants}I` : ''}
                  </p>
                </div>
              </div>
            </div>
            {booking.special_requests && (
              <div className="mt-4 pt-4 border-t border-brand-steel/10">
                <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Solicitudes especiales</p>
                <p className="text-brand-silver text-sm">{booking.special_requests}</p>
              </div>
            )}
          </div>

          {/* Passengers */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-wine" /> Pasajeros ({booking.passengers.length})
              </h2>
              <div className="space-y-2">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10">
                    <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-brand-rose" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{p.title ? `${p.title} ` : ''}{p.first_name} {p.last_name}</p>
                      <p className="text-brand-steel text-xs">{PASSENGER_TYPE[p.passenger_type] ?? p.passenger_type}{p.nationality ? ` · ${p.nationality}` : ''}</p>
                    </div>
                    {p.passport_number && (
                      <p className="text-brand-steel text-xs font-mono">{p.passport_number}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel bookings */}
          {booking.hotel_bookings && booking.hotel_bookings.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Hotel className="h-4 w-4 text-brand-wine" /> Hoteles reservados
              </h2>
              <div className="space-y-2">
                {booking.hotel_bookings.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10 text-sm">
                    <div>
                      <p className="text-white font-medium">Hotel #{h.hotel}</p>
                      <p className="text-brand-steel text-xs">{formatDate(h.check_in_date)} → {formatDate(h.check_out_date)}</p>
                    </div>
                    <p className="text-white font-semibold">{formatPrice(h.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flight bookings */}
          {booking.flight_bookings && booking.flight_bookings.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Plane className="h-4 w-4 text-brand-wine" /> Vuelos reservados
              </h2>
              <div className="space-y-2">
                {booking.flight_bookings.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10 text-sm">
                    <div>
                      <p className="text-white font-medium">Vuelo #{f.flight}</p>
                      <p className="text-brand-steel text-xs">{f.num_passengers} pasajero{f.num_passengers !== 1 ? 's' : ''}{f.pnr_number ? ` · PNR: ${f.pnr_number}` : ''}</p>
                    </div>
                    <p className="text-white font-semibold">{formatPrice(f.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Payment summary */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-wine" /> Pago
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
              <div className="flex justify-between pt-2 border-t border-brand-steel/10 font-semibold">
                <span className="text-white">Total</span>
                <span className="font-display text-lg text-white">{formatPrice(booking.total_amount)}</span>
              </div>
              {parseFloat(booking.paid_amount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Pagado</span>
                  <span>{formatPrice(booking.paid_amount)}</span>
                </div>
              )}
            </div>

            {/* Payment status */}
            <div className="mt-4 pt-4 border-t border-brand-steel/10">
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-2">Estado de pago</p>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${py.dot}`} />
                <span className="text-white font-medium text-sm">{py.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['unpaid', 'partial', 'paid', 'refunded'] as PaymentStatus[])
                  .filter(s => s !== booking.payment_status)
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => updatePayment.mutate(s)}
                      disabled={updatePayment.isPending}
                      className="px-2 py-1.5 rounded-lg border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-wine/30 text-xs font-medium transition-colors disabled:opacity-40"
                    >
                      {PAYMENT_LABELS[s]}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Status control */}
          {st.next.length > 0 && (
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <p className="text-xs text-brand-steel uppercase tracking-wider mb-3">Cambiar estado</p>
              <div className="space-y-2">
                {st.next.map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const Icon = cfg.icon
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus.mutate(s)}
                      disabled={updateStatus.isPending}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40 ${cfg.classes} hover:opacity-80`}
                    >
                      {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                      {STATUS_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-2 text-sm">
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
