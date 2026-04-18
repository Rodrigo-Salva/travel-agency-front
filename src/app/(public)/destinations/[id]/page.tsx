'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Globe, Calendar, Package } from 'lucide-react'
import { useDestination } from '@/features/destinations/hooks/useDestinations'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { ROUTES } from '@/lib/constants/routes'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
}

export default function DestinationDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: destination, isLoading, isError } = useDestination(id)
  const { data: packagesData, isLoading: packagesLoading } = usePackages(
    { page_size: 6 },
  )

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = destination?.image
    ? destination.image.startsWith('http')
      ? destination.image
      : `${BASE_URL}${destination.image}`
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest animate-pulse">
        <div className="h-80 bg-brand-dark" />
        <div className="container mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-64 bg-brand-steel/20 rounded" />
          <div className="h-4 w-full max-w-2xl bg-brand-steel/10 rounded" />
          <div className="h-4 w-3/4 bg-brand-steel/10 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !destination) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <MapPin className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Destino no encontrado</h2>
        <p className="text-brand-silver">El destino que buscas no existe o fue eliminado.</p>
        <Link
          href={ROUTES.destinations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a destinos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero image */}
      <div className="relative h-[420px] bg-brand-dark overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={destination.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark to-brand-darkest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-brand-darkest/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-0 right-0 container mx-auto px-4">
          <Link
            href={ROUTES.destinations}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors bg-brand-darkest/60 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos los destinos
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            {destination.is_popular && (
              <Badge className="bg-brand-wine/90 border-0 text-white flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Popular
              </Badge>
            )}
            <Badge variant="secondary" className="bg-brand-darkest/80 border-brand-steel/20 text-brand-silver">
              {destination.continent}
            </Badge>
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">{destination.name}</h1>
          <div className="flex items-center gap-2 text-brand-rose text-sm font-medium">
            <MapPin className="h-4 w-4" />
            {destination.country}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Sobre este destino</h2>
              <p className="text-brand-silver leading-relaxed text-base">
                {destination.description || destination.short_description}
              </p>
            </div>

            {/* Packages for this destination */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-white">Paquetes disponibles</h2>
                <Link
                  href={ROUTES.packages}
                  className="text-sm text-brand-silver hover:text-white transition-colors flex items-center gap-1"
                >
                  Ver todos
                  <Package className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {packagesLoading
                  ? Array.from({ length: 4 }).map((_, i) => <PackageCardSkeleton key={i} />)
                  : packagesData?.packages.slice(0, 4).map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Quick info */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                Informacion rapida
              </h3>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-brand-wine" />
                </div>
                <div>
                  <p className="text-brand-steel text-xs">Continente</p>
                  <p className="text-white font-medium">{destination.continent}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-brand-wine" />
                </div>
                <div>
                  <p className="text-brand-steel text-xs">Pais</p>
                  <p className="text-white font-medium">{destination.country}</p>
                </div>
              </div>

              {destination.best_season && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-brand-wine" />
                  </div>
                  <div>
                    <p className="text-brand-steel text-xs">Mejor epoca</p>
                    <p className="text-white font-medium">{destination.best_season}</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-wine/30 to-brand-dark border border-brand-wine/20 p-5">
              <h3 className="font-display text-lg font-bold text-white mb-2">
                ¿Listo para viajar?
              </h3>
              <p className="text-brand-silver text-sm mb-4">
                Explora nuestros paquetes y encuentra la experiencia perfecta.
              </p>
              <Link
                href={ROUTES.packages}
                className="block text-center w-full px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Ver paquetes
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
