'use client'

import { useState } from 'react'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { PackageFiltersBar } from '@/features/packages/components/PackageFilters'
import type { PackageFilters } from '@/features/packages/types/package.types'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'

export default function PackagesPage() {
  const [filters, setFilters] = useState<PackageFilters>({ page: 1, page_size: 12 })
  const { data, isLoading } = usePackages(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
            <Package className="h-4 w-4" />
            Todo incluido
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Paquetes de viaje</h1>
          <p className="text-brand-silver max-w-2xl text-lg">
            Paquetes diseñados para que solo te preocupes de disfrutar. Vuelos, hotel,
            traslados y actividades en un solo lugar.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="mb-8 p-4 rounded-2xl bg-brand-dark border border-brand-steel/10">
          <PackageFiltersBar
            filters={filters}
            onChange={(f) => setFilters({ ...f, page_size: 12 })}
          />
        </div>

        {/* Results count */}
        {!isLoading && data && (
          <p className="text-sm text-brand-steel mb-6">
            {data.count} paquete{data.count !== 1 ? 's' : ''} encontrado{data.count !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <PackageCardSkeleton key={i} />)
            : data?.packages.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <Package className="h-12 w-12 text-brand-steel/40 mb-4" />
                <p className="text-brand-silver text-lg font-medium">No se encontraron paquetes</p>
                <p className="text-brand-steel text-sm mt-2">Intenta ajustar los filtros de busqueda</p>
              </div>
            )
            : data?.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
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
