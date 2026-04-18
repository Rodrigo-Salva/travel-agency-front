'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { CalendarDays, UserCheck, FileText, CheckCircle2, MapPin } from 'lucide-react'
import { useWizardStore } from '../store/wizard.store'
import { WizardStep1 } from './WizardStep1'
import { WizardStep2 } from './WizardStep2'
import { WizardStep3 } from './WizardStep3'
import { WizardStep4 } from './WizardStep4'
import type { PackageSummary } from '@/features/packages/types/package.types'

interface Props {
  pkg: PackageSummary
}

const STEPS = [
  { number: 1, label: 'Fechas', icon: CalendarDays },
  { number: 2, label: 'Pasajeros', icon: UserCheck },
  { number: 3, label: 'Resumen', icon: FileText },
  { number: 4, label: 'Confirmado', icon: CheckCircle2 },
]

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

export function BookingWizard({ pkg }: Props) {
  const { step, state, setPackage, reset } = useWizardStore()

  // Hydrate package info into the store
  useEffect(() => {
    if (state.packageId !== pkg.id) {
      reset()
      setPackage({
        id: pkg.id,
        name: pkg.name,
        image: pkg.image,
        priceAdult: pkg.price_adult,
        priceChild: pkg.price_child,
        durationDays: pkg.duration_days,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg.id])

  const imageUrl = pkg.image
    ? pkg.image.startsWith('http') ? pkg.image : `${BASE_URL}${pkg.image}`
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left — package info card */}
      <aside className="lg:col-span-1">
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden sticky top-6">
          {/* Image */}
          <div className="relative h-48 bg-brand-darkest">
            {imageUrl ? (
              <Image src={imageUrl} alt={pkg.name} fill className="object-cover" sizes="400px" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-brand-wine/20 to-brand-darkest" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/80 to-transparent" />
          </div>

          {/* Info */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-brand-wine text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {pkg.destination_name}
            </div>
            <h3 className="font-display text-lg font-bold text-white leading-tight">{pkg.name}</h3>
            <p className="text-brand-steel text-xs">{pkg.duration_days}d / {pkg.duration_nights}n · {pkg.category_name}</p>

            <div className="pt-3 border-t border-brand-steel/10">
              <p className="text-xs text-brand-steel">Precio por adulto</p>
              <p className="font-display text-2xl font-bold text-white">
                {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(parseFloat(pkg.price_adult))}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right — wizard */}
      <div className="lg:col-span-2">
        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                const isActive = step === s.number
                const isDone = step > s.number
                return (
                  <div key={s.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : isActive
                            ? 'bg-brand-wine/20 border-brand-wine text-brand-rose'
                            : 'bg-brand-dark border-brand-steel/30 text-brand-steel'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-brand-steel'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${step > s.number ? 'bg-emerald-500/40' : 'bg-brand-steel/20'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step content */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          {step === 1 && <WizardStep1 />}
          {step === 2 && <WizardStep2 />}
          {step === 3 && <WizardStep3 />}
          {step === 4 && <WizardStep4 />}
        </div>
      </div>
    </div>
  )
}
