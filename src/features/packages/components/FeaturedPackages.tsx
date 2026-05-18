'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { usePackages } from '../hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from './PackageCard'
import { ROUTES } from '@/lib/constants/routes'

export function FeaturedPackages() {
  const { data, isLoading } = usePackages({ is_featured: true, page_size: 8 })

  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-label mb-3">Paquetes destacados</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
              Viajes que <span className="text-gradient-brand italic">inspiran</span>
            </h2>
            <p className="text-brand-silver/70 mt-4 max-w-lg">
              Paquetes todo incluido diseñados para que solo te preocupes de disfrutar.
            </p>
          </div>
          <Link href={ROUTES.packages} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors shrink-0 ml-8 group">
            Ver todos <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <PackageCardSkeleton key={i} />)
            : data?.packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.packages} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-silver/60 hover:text-brand-rose transition-colors">
            Ver todos los paquetes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
