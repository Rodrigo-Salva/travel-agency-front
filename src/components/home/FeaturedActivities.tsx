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
    <section className="py-20 bg-brand-dark border-t border-brand-steel/10">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
              Experiencias únicas
            </p>
            <h2 className="font-display text-4xl font-bold text-white">Actividades populares</h2>
          </div>
          <Link
            href={ROUTES.activities}
            className="hidden sm:flex items-center gap-2 text-brand-silver hover:text-white transition-colors text-sm font-medium group"
          >
            Ver todas
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ActivityCardSkeleton key={i} />)
            : data?.activities.slice(0, 4).map((activity) => <ActivityCard key={activity.id} activity={activity} />)
          }
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={ROUTES.activities}
            className="inline-flex items-center gap-2 text-brand-silver hover:text-white transition-colors text-sm font-medium"
          >
            Ver todas las actividades <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
