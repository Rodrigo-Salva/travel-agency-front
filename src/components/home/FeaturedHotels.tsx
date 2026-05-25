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
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Alojamiento premium</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
              Hoteles <span className="text-gradient-brand italic">destacados</span>
            </h2>
            <p className="text-brand-silver/70 mt-4 max-w-lg">
              Experiencias de hospedaje cuidadosamente seleccionadas para tu comodidad.
            </p>
          </div>
          <Link href={ROUTES.hotels} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors shrink-0 ml-8 group">
            Ver todos <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : data?.hotels.slice(0, 4).map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.hotels} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors">
            Ver todos los hoteles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
