'use client'

import { useState } from 'react'
import { useHotels } from '@/features/hotels/hooks/useHotels'
import { HotelCard, HotelCardSkeleton } from '@/features/hotels/components/HotelCard'
import { Input } from '@/components/ui/input'
import type { HotelFilters } from '@/features/hotels/types/hotel.types'
import { Search, Star, X, ChevronLeft, ChevronRight } from 'lucide-react'

const STARS = [5, 4, 3, 2, 1]
const ORDERINGS = [
  { label: 'Nombre', value: 'name' },
  { label: 'Precio: menor', value: 'price_per_night' },
  { label: 'Precio: mayor', value: '-price_per_night' },
  { label: 'Estrellas', value: '-star_rating' },
]

export default function HotelsPage() {
  const [filters, setFilters] = useState<HotelFilters>({ page: 1, page_size: 12 })
  const { data, isLoading } = useHotels(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1
  const hasActive = filters.search || filters.star_rating || filters.ordering

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
            <Star className="h-4 w-4" />
            Alojamiento premium
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Hoteles</h1>
          <p className="text-brand-silver max-w-2xl text-lg">
            Hospedaje seleccionado en los mejores destinos. Desde boutiques con encanto hasta resorts de lujo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="mb-8 p-4 rounded-2xl bg-brand-dark border border-brand-steel/10 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
            <Input
              placeholder="Buscar hotel, destino..."
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-9 bg-brand-darkest border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            />
          </div>

          {/* Star filter + ordering */}
          <div className="flex flex-wrap gap-2 items-center">
            {STARS.map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, star_rating: filters.star_rating === s ? undefined : s, page: 1 })}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.star_rating === s
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-brand-darkest border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                }`}
              >
                {s} <Star className={`h-3 w-3 ${filters.star_rating === s ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            ))}

            <div className="ml-auto flex gap-1 flex-wrap">
              {ORDERINGS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFilters({ ...filters, ordering: o.value })}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                    filters.ordering === o.value
                      ? 'bg-brand-darkest text-white border border-brand-wine/40'
                      : 'text-brand-steel hover:text-brand-silver'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {hasActive && (
              <button
                onClick={() => setFilters({ page: 1, page_size: 12 })}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-brand-steel/10 text-brand-silver hover:text-white transition-colors"
              >
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {!isLoading && data && (
          <p className="text-sm text-brand-steel mb-6">
            {data.count} hotel{data.count !== 1 ? 'es' : ''} encontrado{data.count !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : data?.hotels.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <Star className="h-12 w-12 text-brand-steel/40 mb-4" />
                <p className="text-brand-silver text-lg font-medium">No se encontraron hoteles</p>
                <p className="text-brand-steel text-sm mt-2">Intenta con otros filtros</p>
              </div>
            )
            : data?.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, currentPage - 1) }))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <span className="text-sm text-brand-steel px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, currentPage + 1) }))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
