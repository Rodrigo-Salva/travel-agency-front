'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useHotels } from '@/features/hotels/hooks/useHotels'
import { HotelCard, HotelCardSkeleton } from '@/features/hotels/components/HotelCard'
import { ROUTES } from '@/lib/constants/routes'

export function FeaturedHotels() {
  const { data, isLoading } = useHotels({ ordering: '-star_rating', page_size: 4 })

  if (!isLoading && (!data?.hotels || data.hotels.length === 0)) return null

  return (
    <section className="py-20 bg-brand-darkest border-t border-brand-steel/10">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
              Alojamiento premium
            </p>
            <h2 className="font-display text-4xl font-bold text-white">Hoteles destacados</h2>
          </div>
          <Link
            href={ROUTES.hotels}
            className="hidden sm:flex items-center gap-2 text-brand-silver hover:text-white transition-colors text-sm font-medium group"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : data?.hotels.slice(0, 4).map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
          }
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={ROUTES.hotels}
            className="inline-flex items-center gap-2 text-brand-silver hover:text-white transition-colors text-sm font-medium"
          >
            Ver todos los hoteles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
