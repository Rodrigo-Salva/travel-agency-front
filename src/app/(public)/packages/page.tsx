'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { PackageFiltersBar } from '@/features/packages/components/PackageFilters'
import type { PackageFilters } from '@/features/packages/types/package.types'
import { ChevronLeft, ChevronRight, Package, GitCompare, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { SurpriseMeButton } from '@/components/ui/SurpriseMeButton'

function PackagesContent() {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<PackageFilters>(() => ({
    page: 1,
    page_size: 12,
    search:    searchParams.get('search')    || undefined,
    min_days:  searchParams.get('min_days')  ? Number(searchParams.get('min_days'))  : undefined,
    max_days:  searchParams.get('max_days')  ? Number(searchParams.get('max_days'))  : undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
  }))
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const s         = searchParams.get('search')
    const min_days  = searchParams.get('min_days')  ? Number(searchParams.get('min_days'))  : undefined
    const max_days  = searchParams.get('max_days')  ? Number(searchParams.get('max_days'))  : undefined
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined
    setFilters(prev => ({
      ...prev,
      search: s || undefined,
      min_days, max_days, min_price, max_price,
      page: 1,
    }))
  }, [searchParams])
  const { data, isLoading } = usePackages(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-dark border-b border-brand-steel/15 pt-16 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-wine/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-wine/30 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-brand-rose text-xs font-bold uppercase tracking-widest mb-3">
            <Package className="h-3.5 w-3.5" />
            Todo incluido
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">Paquetes de viaje</h1>
              <p className="text-brand-silver/80 max-w-xl">
                Paquetes diseñados para que solo te preocupes de disfrutar. Vuelos, hotel, traslados y actividades en un solo lugar.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-2 flex-wrap">
              <SurpriseMeButton
                mode="package"
                className="px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40 text-sm"
              />
              <Link
                href={ROUTES.comparePackages}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine/10 border border-brand-wine/30 text-brand-rose text-sm font-semibold hover:bg-brand-wine/20 transition-colors"
              >
                <GitCompare className="h-4 w-4" />
                Comparar paquetes
              </Link>
            </div>
          </div>
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

        {/* Results count + view toggle */}
        {!isLoading && data && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-brand-steel">
              {data.count} paquete{data.count !== 1 ? 's' : ''} encontrado{data.count !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-brand-dark border border-brand-steel/10">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-brand-wine text-white' : 'text-brand-steel hover:text-white'}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-brand-wine text-white' : 'text-brand-steel hover:text-white'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <PackageCardSkeleton key={i} />)}
          </div>
        ) : data?.packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-brand-steel/40 mb-4" />
            <p className="text-brand-silver text-lg font-medium">No se encontraron paquetes</p>
            <p className="text-brand-steel text-sm mt-2">Intenta ajustar los filtros de busqueda</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} listMode />)}
          </div>
        )}

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

export default function PackagesPage() {
  return (
    <Suspense>
      <PackagesContent />
    </Suspense>
  )
}
