'use client'

import { usePackages } from '@/features/packages/hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

interface Props {
  currentId: number
  destinationName?: string
}

export function RelatedPackages({ currentId, destinationName }: Props) {
  const { data, isLoading } = usePackages({ page_size: 5 })

  const related = data?.packages.filter(p => p.id !== currentId).slice(0, 4) ?? []

  if (!isLoading && related.length === 0) return null

  return (
    <section className="py-16 border-t border-brand-steel/10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-label mb-2">También te puede gustar</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            {destinationName ? `Más en ${destinationName}` : 'Paquetes similares'}
          </h2>
        </div>
        <Link href={ROUTES.packages} className="hidden sm:flex items-center gap-1.5 text-sm text-brand-silver/60 hover:text-brand-rose transition-colors group">
          Ver todos <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PackageCardSkeleton key={i} />)
          : related.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
        }
      </div>
    </section>
  )
}
