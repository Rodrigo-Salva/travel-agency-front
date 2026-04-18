'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, Users, Minus, Plus, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWizardStore } from '../store/wizard.store'
import { formatPrice } from '@/lib/utils/format'

const schema = z.object({
  travelDate: z.string().min(1, 'Selecciona la fecha de salida'),
  returnDate: z.string().optional(),
}).refine((d) => {
  if (!d.returnDate || !d.travelDate) return true
  return new Date(d.returnDate) > new Date(d.travelDate)
}, { message: 'La fecha de regreso debe ser posterior a la de salida', path: ['returnDate'] })

type FormData = z.infer<typeof schema>

const today = new Date().toISOString().split('T')[0]

export function WizardStep1() {
  const { state, setDates, setPax, nextStep } = useWizardStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { travelDate: state.travelDate, returnDate: state.returnDate },
  })

  const onSubmit = (data: FormData) => {
    setDates(data.travelDate, data.returnDate ?? '')
    nextStep()
  }

  const adults = state.numAdults
  const children = state.numChildren
  const infants = state.numInfants
  const total = state.total

  function Counter({
    label,
    sub,
    value,
    onDec,
    onInc,
    min = 0,
  }: {
    label: string
    sub: string
    value: number
    onDec: () => void
    onInc: () => void
    min?: number
  }) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-brand-steel/10 last:border-0">
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          <p className="text-brand-steel text-xs">{sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDec}
            disabled={value <= min}
            className="w-8 h-8 rounded-full border border-brand-steel/20 flex items-center justify-center text-brand-silver hover:border-brand-wine hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-white font-semibold text-sm">{value}</span>
          <button
            type="button"
            onClick={onInc}
            className="w-8 h-8 rounded-full border border-brand-steel/20 flex items-center justify-center text-brand-silver hover:border-brand-wine hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Fechas */}
      <div>
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white mb-5">
          <CalendarDays className="h-5 w-5 text-brand-wine" />
          Fechas de viaje
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-brand-silver text-sm">Fecha de salida *</Label>
            <Input
              type="date"
              min={today}
              {...register('travelDate')}
              className="bg-brand-dark border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]"
            />
            {errors.travelDate && (
              <p className="text-red-400 text-xs">{errors.travelDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-brand-silver text-sm">Fecha de regreso</Label>
            <Input
              type="date"
              min={today}
              {...register('returnDate')}
              className="bg-brand-dark border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]"
            />
            {errors.returnDate && (
              <p className="text-red-400 text-xs">{errors.returnDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pasajeros */}
      <div>
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white mb-5">
          <Users className="h-5 w-5 text-brand-wine" />
          Pasajeros
        </h3>
        <div className="rounded-xl bg-brand-dark border border-brand-steel/10 px-5 py-2">
          <Counter
            label="Adultos"
            sub={`${formatPrice(state.priceAdult)} c/u`}
            value={adults}
            min={1}
            onDec={() => setPax(Math.max(1, adults - 1), children, infants)}
            onInc={() => setPax(adults + 1, children, infants)}
          />
          <Counter
            label="Niños"
            sub={`${formatPrice(state.priceChild)} c/u · 2-11 años`}
            value={children}
            onDec={() => setPax(adults, Math.max(0, children - 1), infants)}
            onInc={() => setPax(adults, children + 1, infants)}
          />
          <Counter
            label="Infantes"
            sub="Gratis · 0-23 meses"
            value={infants}
            onDec={() => setPax(adults, children, Math.max(0, infants - 1))}
            onInc={() => setPax(adults, children, infants + 1)}
          />
        </div>
      </div>

      {/* Total preview */}
      <div className="flex items-center justify-between rounded-xl bg-brand-wine/10 border border-brand-wine/20 px-5 py-4">
        <div>
          <p className="text-brand-steel text-xs">Total estimado</p>
          <p className="font-display text-2xl font-bold text-white">{formatPrice(total)}</p>
          <p className="text-brand-steel text-xs">
            {adults} adulto{adults !== 1 ? 's' : ''}
            {children > 0 ? ` · ${children} niño${children !== 1 ? 's' : ''}` : ''}
            {infants > 0 ? ` · ${infants} infante${infants !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
