'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { usePackages } from '../hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from './PackageCard'
import { ROUTES } from '@/lib/constants/routes'

export function FeaturedPackages() {
  const { data, isLoading } = usePackages({ is_featured: true, page_size: 8 })

  return (
    <section className="py-20 bg-brand-darkest">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
              Paquetes destacados
            </p>
            <h2 className="font-display text-4xl font-bold text-white">Viajes que inspiran</h2>
            <p className="text-brand-silver mt-3 max-w-xl">
              Paquetes todo incluido diseñados para que solo te preocupes de disfrutar.
            </p>
          </div>
          <Link
            href={ROUTES.packages}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-silver hover:text-white transition-colors shrink-0 ml-8"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <PackageCardSkeleton key={i} />)
            : data?.packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href={ROUTES.packages}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-silver hover:text-white transition-colors"
          >
            Ver todos los paquetes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
