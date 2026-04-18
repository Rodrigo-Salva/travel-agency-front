'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCategories } from '../hooks/usePackages'
import type { PackageFilters } from '../types/package.types'

interface Props {
  filters: PackageFilters
  onChange: (filters: PackageFilters) => void
}

const ORDERINGS = [
  { label: 'Mas recientes', value: '-created_at' },
  { label: 'Precio: menor', value: 'price_adult' },
  { label: 'Precio: mayor', value: '-price_adult' },
  { label: 'Duracion', value: 'duration_days' },
]

const DURATIONS = [
  { label: '1-3 dias', value: 1, max: 3 },
  { label: '4-7 dias', value: 4, max: 7 },
  { label: '8-14 dias', value: 8, max: 14 },
  { label: '15+ dias', value: 15, max: undefined },
]

export function PackageFiltersBar({ filters, onChange }: Props) {
  const { data: categories } = useCategories()
  const hasActive = filters.search || filters.category || filters.is_featured || filters.min_days || filters.max_price

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input
          placeholder="Buscar paquetes, destinos..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Featured */}
        <button
          onClick={() => onChange({ ...filters, is_featured: filters.is_featured ? undefined : true, page: 1 })}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.is_featured
              ? 'bg-brand-wine text-white'
              : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
          }`}
        >
          ⭐ Destacados
        </button>

        {/* Categories */}
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange({ ...filters, category: filters.category === cat.id ? undefined : cat.id, page: 1 })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.category === cat.id
                ? 'bg-brand-wine text-white'
                : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}

        {/* Duration filter */}
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => onChange({ ...filters, min_days: filters.min_days === d.value ? undefined : d.value, max_price: undefined, page: 1 })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.min_days === d.value
                ? 'bg-brand-steel text-white'
                : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
            }`}
          >
            {d.label}
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

      {/* Ordering */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-steel" />
        <span className="text-xs text-brand-steel">Ordenar:</span>
        <div className="flex gap-1 flex-wrap">
          {ORDERINGS.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange({ ...filters, ordering: o.value })}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                filters.ordering === o.value
                  ? 'bg-brand-dark text-white border border-brand-wine/40'
                  : 'text-brand-steel hover:text-brand-silver'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
