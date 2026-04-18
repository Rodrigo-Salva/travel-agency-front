'use client'

import { useState } from 'react'
import { useActivities } from '@/features/activities/hooks/useActivities'
import { ActivityCard, ActivityCardSkeleton } from '@/features/activities/components/ActivityCard'
import { Input } from '@/components/ui/input'
import type { ActivityFilters, ActivityType, DifficultyLevel } from '@/features/activities/types/activity.types'
import { Search, Zap, X, ChevronLeft, ChevronRight } from 'lucide-react'

const TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Turismo', value: 'sightseeing' },
  { label: 'Aventura', value: 'adventure' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Deportes', value: 'sports' },
  { label: 'Bienestar', value: 'wellness' },
  { label: 'Comida', value: 'dining' },
  { label: 'Compras', value: 'shopping' },
  { label: 'Entretenimiento', value: 'entertainment' },
]

const DIFFICULTIES: { label: string; value: DifficultyLevel }[] = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Moderado', value: 'moderate' },
  { label: 'Difícil', value: 'difficult' },
]

export default function ActivitiesPage() {
  const [filters, setFilters] = useState<ActivityFilters>({ page: 1, page_size: 12 })
  const { data, isLoading } = useActivities(filters)

  const totalPages = data ? Math.ceil(data.count / (filters.page_size ?? 12)) : 0
  const currentPage = filters.page ?? 1
  const hasActive = filters.search || filters.activity_type || filters.difficulty_level

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
            <Zap className="h-4 w-4" />
            Experiencias únicas
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Actividades</h1>
          <p className="text-brand-silver max-w-2xl text-lg">
            Desde aventuras extremas hasta experiencias culturales. Encuentra la actividad perfecta para tu viaje.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="mb-8 p-4 rounded-2xl bg-brand-dark border border-brand-steel/10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
            <Input
              placeholder="Buscar actividad..."
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-9 bg-brand-darkest border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilters({ ...filters, activity_type: filters.activity_type === t.value ? undefined : t.value, page: 1 })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.activity_type === t.value
                    ? 'bg-brand-wine text-white'
                    : 'bg-brand-darkest border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setFilters({ ...filters, difficulty_level: filters.difficulty_level === d.value ? undefined : d.value, page: 1 })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.difficulty_level === d.value
                    ? 'bg-brand-steel text-white'
                    : 'bg-brand-darkest border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
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
            {data.count} actividad{data.count !== 1 ? 'es' : ''} encontrada{data.count !== 1 ? 's' : ''}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <ActivityCardSkeleton key={i} />)
            : data?.activities.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <Zap className="h-12 w-12 text-brand-steel/40 mb-4" />
                <p className="text-brand-silver text-lg font-medium">No se encontraron actividades</p>
                <p className="text-brand-steel text-sm mt-2">Intenta con otros filtros</p>
              </div>
            )
            : data?.activities.map((act) => <ActivityCard key={act.id} activity={act} />)}
        </div>

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
