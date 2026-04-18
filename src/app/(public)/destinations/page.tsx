'use client'

import { useState } from 'react'
import { useDestinations } from '@/features/destinations/hooks/useDestinations'
import { DestinationCard, DestinationCardSkeleton } from '@/features/destinations/components/DestinationCard'
import { DestinationFiltersBar } from '@/features/destinations/components/DestinationFilters'
import type { DestinationFilters } from '@/features/destinations/types/destination.types'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

export default function DestinationsPage() {
  const [filters, setFilters] = useState<DestinationFilters>({ page: 1, page_size: 12 })
  const { data, isLoading } = useDestinations(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
            <MapPin className="h-4 w-4" />
            Explora el mundo
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Destinos</h1>
          <p className="text-brand-silver max-w-2xl text-lg">
            Descubre lugares increibles alrededor del mundo. Desde playas paradisiacas hasta
            ciudades historicas llenas de cultura.
          </p>
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
