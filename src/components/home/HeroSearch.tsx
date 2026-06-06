'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Users, DollarSign,
  Clock, ChevronDown, SlidersHorizontal, X,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { SurpriseMeButton } from '@/components/ui/SurpriseMeButton'

const TABS = ['Paquetes', 'Destinos', 'Hoteles', 'Actividades'] as const
type Tab = typeof TABS[number]

const DURATION_OPTIONS = [
  { label: 'Cualquier duración', min: undefined, max: undefined },
  { label: '1-3 días',           min: 1,         max: 3         },
  { label: '4-7 días',           min: 4,         max: 7         },
  { label: '8-14 días',          min: 8,         max: 14        },
  { label: '15+ días',           min: 15,        max: undefined },
]

const BUDGET_OPTIONS = [
  { label: 'Cualquier precio',   min: undefined, max: undefined  },
  { label: 'Hasta $500',         min: undefined, max: 500        },
  { label: '$500 – $1,000',      min: 500,       max: 1000       },
  { label: '$1,000 – $2,500',    min: 1000,      max: 2500       },
  { label: '$2,500+',            min: 2500,      max: undefined  },
]

const TAB_ROUTES: Record<Tab, string> = {
  Paquetes:    ROUTES.packages,
  Destinos:    ROUTES.destinations,
  Hoteles:     ROUTES.hotels,
  Actividades: ROUTES.activities,
}

interface SelectProps {
  icon: React.ReactNode
  value: string
  options: { label: string }[]
  onChange: (v: string) => void
  placeholder: string
}

function SelectField({ icon, value, options, onChange, placeholder }: SelectProps) {
  return (
    <div className="relative flex items-center gap-2 flex-1 min-w-[140px] rounded-xl bg-white/8 border border-white/10 focus-within:border-white/25 transition-colors px-3 py-2.5">
      <span className="text-brand-rose flex-shrink-0">{icon}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none"
      >
        <option value="" className="bg-brand-dark">{placeholder}</option>
        {options.map(o => (
          <option key={o.label} value={o.label} className="bg-brand-dark">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="h-3 w-3 text-white/30 flex-shrink-0 pointer-events-none" />
    </div>
  )
}

export function HeroSearch() {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('Paquetes')
  const [query, setQuery]       = useState('')
  const [travelers, setTravelers] = useState(2)
  const [duration, setDuration] = useState('')
  const [budget, setBudget]     = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  function handleSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())

    if (tab === 'Paquetes') {
      const dur = DURATION_OPTIONS.find(d => d.label === duration)
      if (dur?.min) params.set('min_days', String(dur.min))
      if (dur?.max) params.set('max_days', String(dur.max))

      const bud = BUDGET_OPTIONS.find(b => b.label === budget)
      if (bud?.min) params.set('min_price', String(bud.min))
      if (bud?.max) params.set('max_price', String(bud.max))

      if (travelers > 1) params.set('min_people', String(travelers))
    }

    router.push(`${TAB_ROUTES[tab]}?${params.toString()}`)
  }

  const hasFilters = duration || budget || travelers !== 2

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-all ${
              tab === t
                ? 'text-white border-b-2 border-brand-rose bg-white/5'
                : 'text-white/40 hover:text-white/70'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {/* Main row */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Destination input */}
          <div className="flex items-center gap-3 flex-1 rounded-xl bg-white/8 border border-white/10 focus-within:border-white/25 transition-colors px-4 py-3">
            <MapPin className="h-4 w-4 text-brand-rose flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="¿A dónde quieres ir?"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-white/30 hover:text-white transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Travelers */}
          <div className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/10 px-4 py-3 min-w-[130px]">
            <Users className="h-4 w-4 text-brand-rose flex-shrink-0" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors flex items-center justify-center leading-none"
              >−</button>
              <span className="text-sm text-white font-medium w-5 text-center">{travelers}</span>
              <button
                onClick={() => setTravelers(Math.min(20, travelers + 1))}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors flex items-center justify-center leading-none"
              >+</button>
            </div>
            <span className="text-white/40 text-xs">viajeros</span>
          </div>
        </div>

        {/* Advanced filters — Paquetes only */}
        {tab === 'Paquetes' && (
          <>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors ml-1"
            >
              <SlidersHorizontal className="h-3 w-3" />
              {showAdvanced ? 'Ocultar filtros' : 'Filtros avanzados'}
              {hasFilters && !showAdvanced && (
                <span className="ml-1 w-4 h-4 rounded-full bg-brand-wine text-white text-[9px] flex items-center justify-center font-bold">
                  {[duration, budget, travelers !== 2].filter(Boolean).length}
                </span>
              )}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <SelectField
                  icon={<Clock className="h-4 w-4" />}
                  value={duration}
                  options={DURATION_OPTIONS.slice(1)}
                  onChange={setDuration}
                  placeholder="Duración"
                />
                <SelectField
                  icon={<DollarSign className="h-4 w-4" />}
                  value={budget}
                  options={BUDGET_OPTIONS.slice(1)}
                  onChange={setBudget}
                  placeholder="Presupuesto"
                />
              </div>
            )}
          </>
        )}

        {/* Buttons row */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-wine hover:bg-brand-wine/85 text-white py-3 font-bold rounded-xl transition-all text-sm"
          >
            <Search className="h-4 w-4" />
            Buscar {tab}
          </button>
          {tab === 'Paquetes' && (
            <SurpriseMeButton
              mode="package"
              label="¡Sorpréndeme!"
              className="px-4 py-3 rounded-xl bg-white/8 border border-white/10 hover:bg-white/15 text-white/70 hover:text-white text-sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}
