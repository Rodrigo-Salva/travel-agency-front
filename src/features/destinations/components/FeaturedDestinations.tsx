'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDestinations } from '../hooks/useDestinations'
import { DestinationCard, DestinationCardSkeleton } from './DestinationCard'
import { ROUTES } from '@/lib/constants/routes'
import { FadeIn } from '@/components/ui/FadeIn'

export function FeaturedDestinations() {
  const { data, isLoading } = useDestinations({ is_popular: true, page_size: 6 })

  return (
    <section className="py-24 bg-brand-darkest relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <FadeIn className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Destinos populares</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
              Explora el <span className="text-gradient-brand italic">mundo</span>
            </h2>
            <p className="text-brand-silver/70 mt-4 max-w-lg">
              Desde playas paradisiacas hasta ciudades históricas, tenemos el destino perfecto para ti.
            </p>
          </div>
          <Link href={ROUTES.destinations} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors shrink-0 ml-8 group">
            Ver todos <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <DestinationCardSkeleton key={i} />)
            : data?.destinations.map(dest => <DestinationCard key={dest.id} destination={dest} />)}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.destinations} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors">
            Ver todos los destinos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
