'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { DestinationFilters } from '../types/destination.types'

const CONTINENTS = ['Africa', 'America', 'Asia', 'Europa', 'Oceania']
const SEASONS = ['Verano', 'Invierno', 'Primavera', 'Otoño', 'Todo el año']

interface Props {
  filters: DestinationFilters
  onChange: (filters: DestinationFilters) => void
}

export function DestinationFiltersBar({ filters, onChange }: Props) {
  const hasActive = filters.search || filters.continent || filters.is_popular !== undefined || filters.best_season

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input
          placeholder="Buscar destino, pais..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Popular */}
        <button
          onClick={() => onChange({ ...filters, is_popular: filters.is_popular ? undefined : true, page: 1 })}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.is_popular
              ? 'bg-brand-wine text-white'
              : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
          }`}
        >
          ⭐ Populares
        </button>

        {/* Continents */}
        {CONTINENTS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ ...filters, continent: filters.continent === c ? undefined : (c as DestinationFilters['continent']), page: 1 })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.continent === c
                ? 'bg-brand-wine text-white'
                : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}

        {/* Clear */}
        {hasActive && (
          <button
            onClick={() => onChange({})}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/10 text-brand-silver hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
