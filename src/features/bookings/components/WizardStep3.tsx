'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, CheckCircle2, Clock, Users, CalendarDays, FileText,
  Loader2, MapPin, Plane, Tag, X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { queryKeys } from '@/lib/query/keys'
import { useWizardStore } from '../store/wizard.store'
import { bookingsApi } from '../api/bookings.api'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

const PASSENGER_LABELS = { adult: 'Adulto', child: 'Niño', infant: 'Infante' }

interface CouponResult {
  coupon_id: number
  discount_type: string
  discount_value: string
  discount_amount: string
  final_amount: string
  mensaje: string
}

export function WizardStep3() {
  const { state, setSpecialRequests, prevStep, nextStep, setCompletedBooking } = useWizardStore()
  const qc = useQueryClient()
  const [requests, setRequests] = useState(state.specialRequests)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<CouponResult | null>(null)

  const total = state.total
  const discount = coupon ? parseFloat(coupon.discount_amount) : 0
  const finalTotal = total - discount

  const validateCoupon = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(API.validateCoupon, {
        code: couponCode.trim().toUpperCase(),
        amount: total,
      })
      return data as CouponResult & { exito: boolean; mensaje: string }
    },
    onSuccess: (data) => {
      if (data.exito) {
        setCoupon(data)
        toast.success(data.mensaje)
      } else {
        toast.error(data.mensaje)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? 'Cupón no válido')
    },
  })

  const removeCoupon = () => {
    setCoupon(null)
    setCouponCode('')
  }

  const mutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        package: state.packageId!,
        travel_date: state.travelDate,
        return_date: state.returnDate || undefined,
        num_adults: state.numAdults,
        num_children: state.numChildren,
        num_infants: state.numInfants,
        special_requests: requests || undefined,
        passengers: state.passengers,
        ...(coupon ? { coupon_id: coupon.coupon_id } : {}),
      }),
    onSuccess: (data) => {
      if (data.exito) {
        setSpecialRequests(requests)
        setCompletedBooking(data.numero_reserva)
        qc.invalidateQueries({ queryKey: queryKeys.bookings.all })
        nextStep()
      } else {
        toast.error('No se pudo crear la reserva')
      }
    },
    onError: (err: any) => {
      const errores = err?.response?.data?.errores
      if (errores) {
        const msg = Object.entries(errores).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        toast.error(msg)
      } else {
        toast.error(err?.response?.data?.mensaje ?? 'Error al conectar con el servidor. Intenta nuevamente.')
      }
    },
  })

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
        <FileText className="h-5 w-5 text-brand-wine" />
        Resumen de tu reserva
      </h3>

      {/* Package summary */}
      <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-brand-wine flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-brand-steel uppercase tracking-wider">Paquete</p>
            <p className="text-white font-semibold">{state.packageName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-steel/10">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-steel" />
            <div>
              <p className="text-xs text-brand-steel">Salida</p>
              <p className="text-white text-sm font-medium">{state.travelDate ? formatDate(state.travelDate) : '—'}</p>
            </div>
          </div>
          {state.returnDate && (
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-brand-steel" />
              <div>
                <p className="text-xs text-brand-steel">Regreso</p>
                <p className="text-white text-sm font-medium">{formatDate(state.returnDate)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-steel" />
            <div>
              <p className="text-xs text-brand-steel">Duracion</p>
              <p className="text-white text-sm font-medium">{state.durationDays} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-steel" />
            <div>
              <p className="text-xs text-brand-steel">Pasajeros</p>
              <p className="text-white text-sm font-medium">
                {state.numAdults}A{state.numChildren > 0 ? ` · ${state.numChildren}N` : ''}{state.numInfants > 0 ? ` · ${state.numInfants}I` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
      {state.passengers.length > 0 && (
        <div className="rounded-xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-brand-steel/10">
            <p className="text-sm font-semibold text-white">Pasajeros</p>
          </div>
          <div className="divide-y divide-brand-steel/10">
            {state.passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-white text-sm font-medium">
                    {p.title ? `${p.title} ` : ''}{p.first_name} {p.last_name}
                  </p>
                  {p.nationality && <p className="text-brand-steel text-xs">{p.nationality}</p>}
                </div>
                <span className="text-xs text-brand-silver bg-brand-darkest px-2.5 py-1 rounded-full">
                  {PASSENGER_LABELS[p.passenger_type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special requests */}
      <div className="space-y-2">
        <label className="text-sm text-brand-silver">Solicitudes especiales (opcional)</label>
        <textarea
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
          rows={3}
          placeholder="Habitacion en piso alto, dieta vegetariana..."
          className="w-full bg-brand-dark border border-brand-steel/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine resize-none"
        />
      </div>

      {/* Coupon */}
      <div className="space-y-2">
        <label className="text-sm text-brand-silver flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> Código de cupón (opcional)
        </label>
        <Link href={ROUTES.promotions} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-wine hover:underline">
          Ver cupones disponibles ↗
        </Link>
        {coupon ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <div>
              <p className="text-emerald-400 font-semibold text-sm">{couponCode.toUpperCase()}</p>
              <p className="text-xs text-brand-silver">{coupon.mensaje} — ahorro: {formatPrice(coupon.discount_amount)}</p>
            </div>
            <button onClick={removeCoupon} className="text-brand-steel hover:text-red-400 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && couponCode && validateCoupon.mutate()}
              placeholder="Ej: VIAJE10"
              className="flex-1 bg-brand-dark border border-brand-steel/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine font-mono uppercase"
            />
            <button
              onClick={() => couponCode && validateCoupon.mutate()}
              disabled={!couponCode || validateCoupon.isPending}
              className="px-4 py-2.5 rounded-xl bg-brand-wine/20 border border-brand-wine/30 text-brand-rose text-sm font-medium hover:bg-brand-wine hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {validateCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
            </button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
        <p className="text-sm font-semibold text-white mb-4">Desglose de precio</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-steel">{state.numAdults} Adulto{state.numAdults !== 1 ? 's' : ''} × {formatPrice(state.priceAdult)}</span>
          <span className="text-white">{formatPrice(parseFloat(state.priceAdult) * state.numAdults)}</span>
        </div>
        {state.numChildren > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-steel">{state.numChildren} Niño{state.numChildren !== 1 ? 's' : ''} × {formatPrice(state.priceChild)}</span>
            <span className="text-white">{formatPrice(parseFloat(state.priceChild) * state.numChildren)}</span>
          </div>
        )}
        {state.numInfants > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-steel">{state.numInfants} Infante{state.numInfants !== 1 ? 's' : ''}</span>
            <span className="text-emerald-400">Gratis</span>
          </div>
        )}
        {coupon && (
          <div className="flex items-center justify-between text-sm text-emerald-400">
            <span>Descuento (cupón {couponCode})</span>
            <span>− {formatPrice(coupon.discount_amount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-brand-steel/10">
          <span className="font-semibold text-white">Total</span>
          <span className="font-display text-xl font-bold text-white">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-wine/40 transition-colors text-sm font-medium disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Atras
        </button>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Confirmando...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4" />Confirmar reserva</>
          )}
        </button>
      </div>
    </div>
  )
}
