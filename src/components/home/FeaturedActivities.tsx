'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useActivities } from '@/features/activities/hooks/useActivities'
import { ActivityCard, ActivityCardSkeleton } from '@/features/activities/components/ActivityCard'
import { ROUTES } from '@/lib/constants/routes'

export function FeaturedActivities() {
  const { data, isLoading } = useActivities({ page_size: 4 })

  if (!isLoading && (!data?.activities || data.activities.length === 0)) return null

  return (
    <section className="py-24 bg-brand-darkest relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Experiencias únicas</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
              Actividades <span className="text-gradient-brand italic">populares</span>
            </h2>
            <p className="text-brand-silver/70 mt-4 max-w-lg">
              Aventuras y experiencias locales que harán de tu viaje algo inolvidable.
            </p>
          </div>
          <Link href={ROUTES.activities} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors shrink-0 ml-8 group">
            Ver todas <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ActivityCardSkeleton key={i} />)
            : data?.activities.slice(0, 4).map(a => <ActivityCard key={a.id} activity={a} />)}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.activities} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors">
            Ver todas las actividades <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
