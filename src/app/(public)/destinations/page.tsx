'use client'

import { useState } from 'react'
import { useDestinations } from '@/features/destinations/hooks/useDestinations'
import { DestinationCard, DestinationCardSkeleton } from '@/features/destinations/components/DestinationCard'
import { DestinationFiltersBar } from '@/features/destinations/components/DestinationFilters'
import type { DestinationFilters } from '@/features/destinations/types/destination.types'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { SurpriseMeButton } from '@/components/ui/SurpriseMeButton'

export default function DestinationsPage() {
  const [filters, setFilters] = useState<DestinationFilters>({ page: 1, page_size: 12 })
  const { data, isLoading } = useDestinations(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-dark border-b border-brand-steel/15 pt-16 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-brand-rose text-xs font-bold uppercase tracking-widest mb-3">
            <MapPin className="h-3.5 w-3.5" />
            Explora el mundo
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">Destinos</h1>
              <p className="text-brand-silver/80 max-w-xl">
                Descubre lugares increíbles alrededor del mundo. Desde playas paradisiacas hasta ciudades históricas llenas de cultura.
              </p>
            </div>
            <SurpriseMeButton
              mode="destination"
              label="Destino aleatorio"
              className="mt-2 flex-shrink-0 px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="mb-8 p-4 rounded-2xl bg-brand-dark border border-brand-steel/10">
          <DestinationFiltersBar
            filters={filters}
            onChange={(f) => setFilters({ ...f, page_size: 12 })}
          />
        </div>

        {/* Results count */}
        {!isLoading && data && (
          <p className="text-sm text-brand-steel mb-6">
            {data.count} destino{data.count !== 1 ? 's' : ''} encontrado{data.count !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <DestinationCardSkeleton key={i} />)
            : data?.destinations.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <MapPin className="h-12 w-12 text-brand-steel/40 mb-4" />
                <p className="text-brand-silver text-lg font-medium">No se encontraron destinos</p>
                <p className="text-brand-steel text-sm mt-2">Intenta ajustar los filtros de busqueda</p>
              </div>
            )
            : data?.destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, currentPage - 1) }))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-3 py-2 text-brand-steel text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p as number }))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? 'bg-brand-wine text-white'
                          : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, currentPage + 1) }))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
