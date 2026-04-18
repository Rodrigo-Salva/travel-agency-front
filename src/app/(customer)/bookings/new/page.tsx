'use client'

import { use, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { usePackage } from '@/features/packages/hooks/usePackages'
import { BookingWizard } from '@/features/bookings/components/BookingWizard'
import { PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { ROUTES } from '@/lib/constants/routes'

function NewBookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const packageId = searchParams.get('package')

  const { data: pkg, isLoading, isError } = usePackage(packageId ?? '')

  if (!packageId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <Package className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Selecciona un paquete</h2>
        <p className="text-brand-silver">Elige un paquete para iniciar tu reserva.</p>
        <Link
          href={ROUTES.packages}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          Ver paquetes
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-brand-steel/20 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-80 bg-brand-dark rounded-2xl border border-brand-steel/10" />
          <div className="lg:col-span-2 h-80 bg-brand-dark rounded-2xl border border-brand-steel/10" />
        </div>
      </div>
    )
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <Package className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Paquete no encontrado</h2>
        <Link href={ROUTES.packages} className="text-brand-silver hover:text-white transition-colors text-sm">
          Volver a paquetes
        </Link>
      </div>
    )
  }

  // Convert PackageDetail -> PackageSummary shape
  const pkgSummary = {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    category_name: pkg.category.name,
    destination_name: typeof pkg.destination === 'string' ? pkg.destination : '',
    short_description: pkg.short_description,
    duration_days: pkg.duration_days,
    duration_nights: pkg.duration_nights,
    price_adult: pkg.price_adult,
    price_child: pkg.price_child,
    image: pkg.image,
    is_featured: pkg.is_featured,
    created_at: pkg.created_at,
  }

  return <BookingWizard pkg={pkgSummary} />
}

export default function NewBookingPage() {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest pt-16 pb-8">
        <div className="container mx-auto px-4">
          <Link
            href={ROUTES.packages}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a paquetes
          </Link>
          <h1 className="font-display text-4xl font-bold text-white">Reservar paquete</h1>
          <p className="text-brand-silver mt-2">Completa los datos para confirmar tu viaje</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Suspense fallback={
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-80 bg-brand-dark rounded-2xl border border-brand-steel/10" />
            <div className="lg:col-span-2 h-80 bg-brand-dark rounded-2xl border border-brand-steel/10" />
          </div>
        }>
          <NewBookingContent />
        </Suspense>
      </div>
    </div>
  )
}
