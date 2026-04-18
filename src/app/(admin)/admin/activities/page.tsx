'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Search, Loader2, Clock, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { activitiesApi } from '@/features/activities/api/activities.api'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

const ACTIVITY_LABELS: Record<string, string> = {
  sightseeing: 'Turismo', adventure: 'Aventura', cultural: 'Cultural',
  shopping: 'Compras', dining: 'Comida', sports: 'Deportes',
  wellness: 'Bienestar', entertainment: 'Entretenimiento',
}
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-emerald-400', moderate: 'text-amber-400', difficult: 'text-red-400',
}
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Fácil', moderate: 'Moderado', difficult: 'Difícil',
}

export default function AdminActivitiesPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.activities.list({ page_size: 100 }),
    queryFn: () => activitiesApi.list({ page_size: 100 }),
    staleTime: 2 * 60 * 1000,
  })

  const activities = data?.activities ?? []
  const filtered = activities.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Actividades</h1>
        <p className="text-brand-silver text-sm mt-1">{activities.length} actividades registradas</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar actividad..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Zap className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay actividades</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Actividad', 'Tipo', 'Dificultad', 'Duración', 'Grupo', 'Precio'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((act) => (
                  <tr key={act.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{act.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-darkest border border-brand-steel/20 text-brand-silver">
                        {ACTIVITY_LABELS[act.activity_type] ?? act.activity_type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${DIFFICULTY_COLORS[act.difficulty_level]}`}>
                      {DIFFICULTY_LABELS[act.difficulty_level]}
                    </td>
                    <td className="px-4 py-3 text-brand-silver">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{act.duration_hours}h</span>
                    </td>
                    <td className="px-4 py-3 text-brand-silver">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />Max {act.max_group_size}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPrice(act.price_per_person)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
