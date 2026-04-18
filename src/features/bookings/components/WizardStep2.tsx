'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCheck, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWizardStore } from '../store/wizard.store'
import type { PassengerType } from '../types/booking.types'

const passengerSchema = z.object({
  passenger_type: z.enum(['adult', 'child', 'infant']),
  title: z.string().optional(),
  first_name: z.string().min(2, 'Minimo 2 caracteres'),
  last_name: z.string().min(2, 'Minimo 2 caracteres'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  passport_number: z.string().optional(),
  nationality: z.string().optional(),
})

const schema = z.object({
  passengers: z.array(passengerSchema).min(1),
})

type FormData = z.infer<typeof schema>

function buildDefaultPassengers(adults: number, children: number, infants: number) {
  const list: FormData['passengers'] = []
  for (let i = 0; i < adults; i++) list.push({ passenger_type: 'adult', first_name: '', last_name: '' })
  for (let i = 0; i < children; i++) list.push({ passenger_type: 'child', first_name: '', last_name: '' })
  for (let i = 0; i < infants; i++) list.push({ passenger_type: 'infant', first_name: '', last_name: '' })
  return list
}

const PASSENGER_LABELS: Record<PassengerType, string> = {
  adult: 'Adulto',
  child: 'Niño',
  infant: 'Infante',
}

const PASSENGER_COLORS: Record<PassengerType, string> = {
  adult: 'bg-brand-wine/20 text-brand-rose border-brand-wine/30',
  child: 'bg-brand-steel/20 text-brand-silver border-brand-steel/30',
  infant: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export function WizardStep2() {
  const { state, setPassengers, nextStep, prevStep } = useWizardStore()

  const defaultPassengers =
    state.passengers.length > 0
      ? state.passengers
      : buildDefaultPassengers(state.numAdults, state.numChildren, state.numInfants)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { passengers: defaultPassengers },
  })

  const onSubmit = (data: FormData) => {
    setPassengers(data.passengers as any)
    nextStep()
  }

  const totalPax = state.numAdults + state.numChildren + state.numInfants

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
        <UserCheck className="h-5 w-5 text-brand-wine" />
        Datos de pasajeros
        <span className="ml-auto text-sm font-normal text-brand-steel">{totalPax} pasajero{totalPax !== 1 ? 's' : ''}</span>
      </h3>

      {defaultPassengers.map((pax, idx) => {
        const type = pax.passenger_type as PassengerType
        const errs = (errors.passengers as any)?.[idx]
        return (
          <div key={idx} className="rounded-xl border border-brand-steel/10 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center gap-2.5 px-5 py-3 border-b border-brand-steel/10 bg-brand-dark`}>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PASSENGER_COLORS[type]}`}>
                {PASSENGER_LABELS[type]} {idx + 1}
              </span>
              <input type="hidden" {...register(`passengers.${idx}.passenger_type`)} />
            </div>

            {/* Fields */}
            <div className="p-5 bg-brand-darkest/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Titulo</Label>
                <div className="relative">
                  <select
                    {...register(`passengers.${idx}.title`)}
                    className="w-full appearance-none bg-brand-dark border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-brand-wine"
                  >
                    <option value="">Sin titulo</option>
                    <option value="Sr">Sr.</option>
                    <option value="Sra">Sra.</option>
                    <option value="Srta">Srta.</option>
                    <option value="Dr">Dr.</option>
                    <option value="Dra">Dra.</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-steel pointer-events-none" />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Genero</Label>
                <div className="relative">
                  <select
                    {...register(`passengers.${idx}.gender`)}
                    className="w-full appearance-none bg-brand-dark border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-brand-wine"
                  >
                    <option value="">Prefiero no decir</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-steel pointer-events-none" />
                </div>
              </div>

              {/* First name */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre *</Label>
                <Input
                  {...register(`passengers.${idx}.first_name`)}
                  placeholder="Como aparece en el pasaporte"
                  className="bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel/50 focus:border-brand-wine text-sm"
                />
                {errs?.first_name && <p className="text-red-400 text-xs">{errs.first_name.message}</p>}
              </div>

              {/* Last name */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Apellido *</Label>
                <Input
                  {...register(`passengers.${idx}.last_name`)}
                  placeholder="Como aparece en el pasaporte"
                  className="bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel/50 focus:border-brand-wine text-sm"
                />
                {errs?.last_name && <p className="text-red-400 text-xs">{errs.last_name.message}</p>}
              </div>

              {/* Date of birth */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  {...register(`passengers.${idx}.date_of_birth`)}
                  className="bg-brand-dark border-brand-steel/20 text-white focus:border-brand-wine text-sm [color-scheme:dark]"
                />
              </div>

              {/* Passport */}
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">N° Pasaporte / DNI</Label>
                <Input
                  {...register(`passengers.${idx}.passport_number`)}
                  placeholder="Opcional"
                  className="bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel/50 focus:border-brand-wine text-sm"
                />
              </div>

              {/* Nationality */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Nacionalidad</Label>
                <Input
                  {...register(`passengers.${idx}.nationality`)}
                  placeholder="Ej: Peruana, Colombiana..."
                  className="bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel/50 focus:border-brand-wine text-sm"
                />
              </div>
            </div>
          </div>
        )
      })}

      {/* Nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-wine/40 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Atras
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
