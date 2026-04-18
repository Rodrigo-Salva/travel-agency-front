'use client'

import Link from 'next/link'
import { CheckCircle2, Copy, ArrowRight, CalendarDays, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useWizardStore } from '../store/wizard.store'
import { formatDate, formatPrice } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

export function WizardStep4() {
  const { state, completedBookingNumber, reset } = useWizardStore()

  const copyCode = () => {
    if (!completedBookingNumber) return
    navigator.clipboard.writeText(completedBookingNumber)
    toast.success('Numero de reserva copiado')
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-wine flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-white">¡Reserva confirmada!</h2>
        <p className="text-brand-silver max-w-sm">
          Tu viaje a <span className="text-white font-medium">{state.packageName}</span> esta reservado.
          Te enviamos los detalles por email.
        </p>
      </div>

      {/* Booking number */}
      {completedBookingNumber && (
        <div className="w-full max-w-sm rounded-2xl bg-brand-dark border border-brand-wine/20 p-5">
          <p className="text-xs text-brand-steel uppercase tracking-wider mb-2">Numero de reserva</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-2xl font-bold text-brand-rose tracking-widest">
              {completedBookingNumber}
            </span>
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg hover:bg-brand-steel/10 text-brand-steel hover:text-white transition-colors"
              title="Copiar"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-brand-steel mt-2">Guarda este numero para rastrear tu reserva</p>
        </div>
      )}

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 justify-center">
        {state.travelDate && (
          <div className="flex items-center gap-1.5 text-sm text-brand-silver bg-brand-dark border border-brand-steel/10 rounded-full px-3 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-brand-wine" />
            {formatDate(state.travelDate)}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-brand-silver bg-brand-dark border border-brand-steel/10 rounded-full px-3 py-1.5">
          <Package className="h-3.5 w-3.5 text-brand-wine" />
          {state.numAdults + state.numChildren + state.numInfants} pasajeros
        </div>
        <div className="flex items-center gap-1.5 text-sm text-brand-silver bg-brand-dark border border-brand-steel/10 rounded-full px-3 py-1.5">
          <span className="text-emerald-400 font-semibold">{formatPrice(state.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
        <Link
          href={ROUTES.customer.bookings}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors text-sm"
        >
          Mis reservas
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={() => { reset(); window.location.href = ROUTES.packages }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-wine/40 transition-colors text-sm font-medium"
        >
          Ver mas paquetes
        </button>
      </div>
    </div>
  )
}
