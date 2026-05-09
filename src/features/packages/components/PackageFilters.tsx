'use client'

import { useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, DollarSign, Clock } from 'lucide-react'
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
  { label: '1-3 dias', min: 1, max: 3 },
  { label: '4-7 dias', min: 4, max: 7 },
  { label: '8-14 dias', min: 8, max: 14 },
  { label: '15+ dias', min: 15, max: undefined },
]

const PRICE_RANGES = [
  { label: 'Hasta $500', min: undefined, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: '$1000 - $2000', min: 1000, max: 2000 },
  { label: '$2000+', min: 2000, max: undefined },
]

export function PackageFiltersBar({ filters, onChange }: Props) {
  const { data: categories } = useCategories()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [priceMin, setPriceMin] = useState(filters.min_price?.toString() ?? '')
  const [priceMax, setPriceMax] = useState(filters.max_price?.toString() ?? '')

  const hasActive = !!(
    filters.search || filters.category || filters.is_featured ||
    filters.min_days || filters.max_days || filters.min_price || filters.max_price
  )

  const activeDuration = DURATIONS.find(
    (d) => d.min === filters.min_days && d.max === filters.max_days
  )

  const activePriceRange = PRICE_RANGES.find(
    (p) => p.min === filters.min_price && p.max === filters.max_price
  )

  function applyDuration(d: typeof DURATIONS[0]) {
    const isActive = d.min === filters.min_days && d.max === filters.max_days
    onChange({
      ...filters,
      min_days: isActive ? undefined : d.min,
      max_days: isActive ? undefined : d.max,
      page: 1,
    })
  }

  function applyPriceRange(p: typeof PRICE_RANGES[0]) {
    const isActive = p.min === filters.min_price && p.max === filters.max_price
    setPriceMin(isActive ? '' : (p.min?.toString() ?? ''))
    setPriceMax(isActive ? '' : (p.max?.toString() ?? ''))
    onChange({
      ...filters,
      min_price: isActive ? undefined : p.min,
      max_price: isActive ? undefined : p.max,
      page: 1,
    })
  }

  function applyCustomPrice() {
    const min = priceMin ? Number(priceMin) : undefined
    const max = priceMax ? Number(priceMax) : undefined
    onChange({ ...filters, min_price: min, max_price: max, page: 1 })
  }

  function clearAll() {
    setPriceMin('')
    setPriceMax('')
    onChange({})
  }

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

        {/* Active filters summary badges */}
        {activeDuration && (
          <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/20 text-brand-silver">
            <Clock className="h-3 w-3" />
            {activeDuration.label}
            <button onClick={() => onChange({ ...filters, min_days: undefined, max_days: undefined, page: 1 })}>
              <X className="h-3 w-3 ml-0.5 hover:text-white" />
            </button>
          </span>
        )}
        {(filters.min_price !== undefined || filters.max_price !== undefined) && !activePriceRange && (
          <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/20 text-brand-silver">
            <DollarSign className="h-3 w-3" />
            {filters.min_price ? `$${filters.min_price}` : ''}{filters.min_price && filters.max_price ? ' - ' : ''}{filters.max_price ? `$${filters.max_price}` : '+'}
            <button onClick={() => { setPriceMin(''); setPriceMax(''); onChange({ ...filters, min_price: undefined, max_price: undefined, page: 1 }) }}>
              <X className="h-3 w-3 ml-0.5 hover:text-white" />
            </button>
          </span>
        )}
        {activePriceRange && (
          <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/20 text-brand-silver">
            <DollarSign className="h-3 w-3" />
            {activePriceRange.label}
            <button onClick={() => { setPriceMin(''); setPriceMax(''); onChange({ ...filters, min_price: undefined, max_price: undefined, page: 1 }) }}>
              <X className="h-3 w-3 ml-0.5 hover:text-white" />
            </button>
          </span>
        )}

        {/* Toggle advanced filters */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white transition-colors"
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filtros
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/10 text-brand-silver hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="rounded-xl border border-brand-steel/15 bg-brand-dark/60 p-4 flex flex-col gap-5">
          {/* Duration */}
          <div>
            <p className="text-xs font-semibold text-brand-silver mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Duracion
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => {
                const isActive = d.min === filters.min_days && d.max === filters.max_days
                return (
                  <button
                    key={d.label}
                    onClick={() => applyDuration(d)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-steel text-white'
                        : 'bg-brand-darkest border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs font-semibold text-brand-silver mb-2 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Precio por adulto
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRICE_RANGES.map((p) => {
                const isActive = p.min === filters.min_price && p.max === filters.max_price
                return (
                  <button
                    key={p.label}
                    onClick={() => applyPriceRange(p)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-wine text-white'
                        : 'bg-brand-darkest border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-steel text-xs">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  onBlur={applyCustomPrice}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomPrice()}
                  className="w-full pl-5 pr-2 py-1.5 rounded-md bg-brand-darkest border border-brand-steel/20 text-white text-xs placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine"
                />
              </div>
              <span className="text-brand-steel/50 text-xs">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-steel text-xs">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  onBlur={applyCustomPrice}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomPrice()}
                  className="w-full pl-5 pr-2 py-1.5 rounded-md bg-brand-darkest border border-brand-steel/20 text-white text-xs placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine"
                />
              </div>
              <button
                onClick={applyCustomPrice}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-wine/80 hover:bg-brand-wine text-white transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

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
