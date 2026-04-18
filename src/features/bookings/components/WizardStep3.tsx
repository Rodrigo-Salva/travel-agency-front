'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
  CalendarDays,
  FileText,
  Loader2,
  MapPin,
  Plane,
} from 'lucide-react'
import { toast } from 'sonner'
import { useWizardStore } from '../store/wizard.store'
import { bookingsApi } from '../api/bookings.api'
import { formatPrice, formatDate, formatDuration } from '@/lib/utils/format'

const PASSENGER_LABELS = { adult: 'Adulto', child: 'Niño', infant: 'Infante' }

export function WizardStep3() {
  const { state, setSpecialRequests, prevStep, nextStep, setCompletedBooking } = useWizardStore()
  const [requests, setRequests] = useState(state.specialRequests)

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
      }),
    onSuccess: (data) => {
      if (data.exito) {
        setSpecialRequests(requests)
        setCompletedBooking(data.numero_reserva)
        nextStep()
      } else {
        toast.error('No se pudo crear la reserva')
      }
    },
    onError: () => {
      toast.error('Error al conectar con el servidor. Intenta nuevamente.')
    },
  })

  const handleConfirm = () => {
    if (!state.packageId) return
    mutation.mutate()
  }

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

      {/* Passengers list */}
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
          placeholder="Habitacion en piso alto, dieta vegetariana, celebracion de cumpleanos..."
          className="w-full bg-brand-dark border border-brand-steel/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine resize-none"
        />
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
        <div className="flex items-center justify-between pt-3 border-t border-brand-steel/10">
          <span className="font-semibold text-white">Total</span>
          <span className="font-display text-xl font-bold text-white">{formatPrice(state.total)}</span>
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
          onClick={handleConfirm}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirmar reserva
            </>
          )}
        </button>
      </div>
    </div>
  )
}
