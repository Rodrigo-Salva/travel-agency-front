'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDestinations } from '../hooks/useDestinations'
import { DestinationCard, DestinationCardSkeleton } from './DestinationCard'
import { ROUTES } from '@/lib/constants/routes'

export function FeaturedDestinations() {
  const { data, isLoading } = useDestinations({ is_popular: true, page_size: 6 })

  return (
    <section className="py-20 bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
              Destinos populares
            </p>
            <h2 className="font-display text-4xl font-bold text-white">Explora el mundo</h2>
            <p className="text-brand-silver mt-3 max-w-xl">
              Desde playas paradisiacas hasta ciudades historicas, tenemos el destino perfecto para ti.
            </p>
          </div>
          <Link
            href={ROUTES.destinations}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-silver hover:text-white transition-colors shrink-0 ml-8"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <DestinationCardSkeleton key={i} />
              ))
            : data?.destinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={ROUTES.destinations}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-silver hover:text-white transition-colors"
          >
            Ver todos los destinos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
