'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeft, CalendarDays, Users, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, DollarSign, FileText, User, Printer, CreditCard, Download,
  Plane, MapPin, Star, ClipboardList,
} from 'lucide-react'
import { toast } from 'sonner'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { BookingStatus, PaymentStatus } from '@/features/bookings/types/booking.types'

// Stripe usa APIs del browser — no puede renderizarse en el servidor
const PaymentModal = dynamic(
  () => import('@/features/bookings/components/PaymentModal'),
  { ssr: false }
)

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

// ── Timeline steps ────────────────────────────────────────────────────────────
const TIMELINE_STEPS: { key: BookingStatus | '_travel'; label: string; icon: typeof CheckCircle2 }[] = [
  { key: 'pending',   label: 'Reserva creada',  icon: FileText },
  { key: 'confirmed', label: 'Confirmada',       icon: CheckCircle2 },
  { key: '_travel',   label: 'En viaje',         icon: Plane },
  { key: 'completed', label: 'Completada',        icon: Star },
]

function BookingTimeline({ status, travelDate }: { status: BookingStatus; travelDate?: string }) {
  const isInTravel = status === 'confirmed' && travelDate && new Date(travelDate) <= new Date()
  const isCancelled = status === 'cancelled'

  function stepState(key: string) {
    if (isCancelled) return key === 'pending' ? 'done' : 'cancelled'
    const order: string[] = ['pending', 'confirmed', '_travel', 'completed']
    const current = isInTravel ? '_travel' : status
    const ci = order.indexOf(current)
    const si = order.indexOf(key)
    if (si < ci) return 'done'
    if (si === ci) return 'active'
    return 'upcoming'
  }

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <p className="text-red-400 font-medium text-sm">Esta reserva fue cancelada.</p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((step, i) => {
        const state = stepState(step.key)
        const Icon = step.icon
        const isLast = i === TIMELINE_STEPS.length - 1
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                state === 'done'    ? 'bg-emerald-500 border-emerald-500 text-white' :
                state === 'active' ? 'bg-brand-wine border-brand-wine text-white scale-110 shadow-lg shadow-brand-wine/30' :
                                     'bg-brand-darkest border-brand-steel/20 text-brand-steel/40'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight whitespace-nowrap px-1 ${
                state === 'active' ? 'text-brand-rose' : state === 'done' ? 'text-emerald-400' : 'text-brand-steel/50'
              }`}>{step.label}</span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full ${
                stepState(TIMELINE_STEPS[i + 1].key) !== 'upcoming' || state === 'done' ? 'bg-emerald-500/50' : 'bg-brand-steel/15'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Countdown hasta viaje ─────────────────────────────────────────────────────
function TripCountdown({ travelDate }: { travelDate: string }) {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    function calc() {
      const diff = new Date(travelDate).getTime() - Date.now()
      if (diff <= 0) return
      setDays(Math.floor(diff / 86400000))
      setHours(Math.floor((diff % 86400000) / 3600000))
      setMinutes(Math.floor((diff % 3600000) / 60000))
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [travelDate])

  const diff = new Date(travelDate).getTime() - Date.now()
  if (diff <= 0) return null

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-wine/20 p-5 flex flex-col sm:flex-row items-center gap-5">
      <div className="w-12 h-12 rounded-xl bg-brand-wine/15 border border-brand-wine/25 flex items-center justify-center flex-shrink-0">
        <Plane className="h-6 w-6 text-brand-rose" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="section-label mb-1">Tiempo para tu viaje</p>
        <p className="text-brand-silver/70 text-sm">¡Ya falta poco! Prepara tu maleta.</p>
      </div>
      <div className="flex items-center gap-3">
        {[{ v: days, l: 'días' }, { v: hours, l: 'horas' }, { v: minutes, l: 'min' }].map(({ v, l }) => (
          <div key={l} className="text-center">
            <p className="font-display text-3xl font-bold text-white leading-none">{String(v).padStart(2, '0')}</p>
            <p className="text-brand-steel text-[10px] uppercase tracking-wider">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Checklist de documentos ───────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: 'passport',  label: 'Pasaporte vigente (min. 6 meses de validez)' },
  { id: 'visa',      label: 'Visa / permisos de entrada (si aplica)' },
  { id: 'insurance', label: 'Seguro de viaje contratado' },
  { id: 'tickets',   label: 'Tickets de vuelo impresos o en el teléfono' },
  { id: 'hotel',     label: 'Vouchers de hotel' },
  { id: 'money',     label: 'Efectivo / tarjeta para el destino' },
  { id: 'clothes',   label: 'Ropa adecuada para el clima' },
  { id: 'meds',      label: 'Medicamentos personales' },
]

function TravelChecklist({ bookingId }: { bookingId: string }) {
  const storageKey = `checklist-${bookingId}`
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]')) }
    catch { return new Set() }
  })

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      return next
    })
  }

  const done = checked.size
  const total = CHECKLIST_ITEMS.length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-brand-wine" /> Checklist de viaje
        </h2>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pct === 100 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-brand-steel/10 text-brand-steel'}`}>
          {done}/{total} completados
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-brand-steel/15 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-wine transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => {
          const isChecked = checked.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isChecked
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-brand-darkest/40 border-brand-steel/10 hover:border-brand-steel/25'
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-brand-steel/30'
              }`}>
                {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${isChecked ? 'line-through text-brand-steel' : 'text-brand-silver'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {pct === 100 && (
        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" /> ¡Todo listo! Buen viaje.
        </div>
      )}
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
  const canPay = booking.payment_status !== 'paid' && booking.status !== 'cancelled' && booking.status !== 'completed'

  const printBadgeClass = `print-badge-${booking.status}`

  return (
    <div className="min-h-screen bg-brand-darkest">

      {/* ── Voucher de impresión (oculto en pantalla) ─────────────────────── */}
      <div className="hidden print-voucher" style={{ fontFamily: 'Arial, sans-serif', padding: '32px', maxWidth: '720px', margin: '0 auto' }}>
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #622347', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ background: '#622347', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '18px' }}>✈</span>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#111' }}>Travel<span style={{ color: '#622347' }}>Agency</span></span>
            </div>
            <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Agencia de viajes — voucher de reserva</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>N° de reserva</p>
            <p style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: '#111', margin: 0 }}>#{booking.booking_number}</p>
            <span className={`${printBadgeClass}`} style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', border: '1px solid' }}>
              {st.label}
            </span>
          </div>
        </div>

        {/* Detalles del viaje */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#622347', margin: '0 0 10px' }}>Detalles del viaje</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {booking.travel_date && (
              <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase' }}>Salida</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: 0 }}>{formatDate(booking.travel_date)}</p>
              </div>
            )}
            {booking.return_date && (
              <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase' }}>Regreso</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: 0 }}>{formatDate(booking.return_date)}</p>
              </div>
            )}
            <div style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase' }}>Pasajeros</p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', margin: 0 }}>
                {booking.num_adults} adulto{booking.num_adults !== 1 ? 's' : ''}
                {booking.num_children > 0 ? `, ${booking.num_children} niño${booking.num_children !== 1 ? 's' : ''}` : ''}
              </p>
            </div>
          </div>
          {booking.special_requests && (
            <div style={{ marginTop: '10px', padding: '10px 12px', border: '1px solid #fbbf24', borderRadius: '8px', background: '#fffbeb' }}>
              <p style={{ fontSize: '10px', color: '#92400e', margin: '0 0 2px', textTransform: 'uppercase' }}>Solicitudes especiales</p>
              <p style={{ fontSize: '12px', color: '#78350f', margin: 0 }}>{booking.special_requests}</p>
            </div>
          )}
        </div>

        {/* Pasajeros */}
        {booking.passengers && booking.passengers.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#622347', margin: '0 0 10px' }}>Pasajeros</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', color: '#555', fontWeight: '600' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', color: '#555', fontWeight: '600' }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', color: '#555', fontWeight: '600' }}>Pasaporte</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 10px', color: '#111', fontWeight: '500' }}>{p.first_name} {p.last_name}</td>
                    <td style={{ padding: '7px 10px', color: '#555' }}>{PASSENGER_TYPE[p.passenger_type] ?? p.passenger_type}</td>
                    <td style={{ padding: '7px 10px', color: '#777', fontFamily: 'monospace' }}>{p.passport_number ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen de pago */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#622347', margin: '0 0 10px' }}>Resumen de pago</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6px 10px', color: '#555' }}>Subtotal</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#111' }}>{formatPrice(booking.subtotal)}</td>
              </tr>
              {parseFloat(booking.discount_amount) > 0 && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#059669' }}>Descuento</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#059669' }}>− {formatPrice(booking.discount_amount)}</td>
                </tr>
              )}
              {parseFloat(booking.tax_amount) > 0 && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 10px', color: '#555' }}>Impuestos</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#111' }}>{formatPrice(booking.tax_amount)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                <td style={{ padding: '8px 10px', fontWeight: '700', color: '#111', fontSize: '14px' }}>Total</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#111', fontSize: '16px' }}>{formatPrice(booking.total_amount)}</td>
              </tr>
              {parseFloat(booking.paid_amount) > 0 && (
                <tr>
                  <td style={{ padding: '6px 10px', color: '#059669' }}>Pagado</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#059669', fontWeight: '600' }}>{formatPrice(booking.paid_amount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer del voucher */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Generado el {formatDate(new Date().toISOString())} · TravelAgency</p>
          <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Presenta este documento en destino</p>
        </div>
      </div>

      {/* ── Vista normal (oculta al imprimir) ─────────────────────────────── */}
      <div className="print-hide">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-14 pb-10">
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

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">

        {/* Timeline */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-wine" /> Estado de la reserva
          </h2>
          <BookingTimeline status={booking.status} travelDate={booking.travel_date ?? undefined} />
        </div>

        {/* Countdown */}
        {booking.travel_date && (booking.status === 'confirmed' || booking.status === 'pending') && (
          <TripCountdown travelDate={booking.travel_date} />
        )}

        {/* Detalles del viaje */}
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

        {/* Checklist de documentos */}
        {(booking.status === 'confirmed' || booking.status === 'pending') && (
          <TravelChecklist bookingId={String(booking.id)} />
        )}

        {/* Voucher / Imprimir */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Download className="h-4 w-4 text-brand-wine" /> Voucher de viaje
          </h2>
          <p className="text-xs text-brand-steel mb-4">Descarga o imprime tu comprobante de reserva.</p>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
          >
            <Printer className="h-4 w-4" /> Descargar / Imprimir voucher
          </button>
          <p className="text-xs text-brand-steel/60 mt-2">En el diálogo elige &quot;Guardar como PDF&quot; para guardar el archivo.</p>
        </div>

        {/* Acciones: pagar + cancelar */}
        {(canPay || canCancel) && (
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 print-hide">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-wine" /> Acciones
            </h2>
            <div className="flex flex-col gap-3">

              {/* Botón pagar */}
              {canPay && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors w-fit"
                >
                  <CreditCard className="h-4 w-4" /> Pagar ahora
                </button>
              )}

              {/* Botón cancelar */}
              {canCancel && (
                confirming ? (
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors w-fit"
                  >
                    <XCircle className="h-4 w-4" /> Cancelar reserva
                  </button>
                )
              )}
            </div>
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

      </div>{/* end container */}
      </div>{/* end print-hide */}

      {/* Modal de pago */}
      {showPaymentModal && (
        <PaymentModal
          bookingId={booking.id}
          totalAmount={booking.total_amount}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => router.push(`/bookings/${booking.id}/confirmation`)}
        />
      )}
    </div>
  )
}
