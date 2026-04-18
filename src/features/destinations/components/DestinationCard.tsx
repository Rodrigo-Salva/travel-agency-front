import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Destination } from '../types/destination.types'

interface Props {
  destination: Destination
}

const PLACEHOLDER_COLORS = [
  'from-brand-dark to-brand-darkest',
  'from-brand-wine/30 to-brand-darkest',
  'from-brand-steel/30 to-brand-darkest',
]

export function DestinationCard({ destination }: Props) {
  const colorIndex = destination.id % PLACEHOLDER_COLORS.length
  const gradientClass = PLACEHOLDER_COLORS[colorIndex]
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = destination.image
    ? destination.image.startsWith('http')
      ? destination.image
      : `${BASE_URL}${destination.image}`
    : null

  return (
    <Link href={ROUTES.destination(destination.id)} className="group relative block h-72 rounded-2xl overflow-hidden border border-brand-steel/10 hover:border-brand-wine/40 transition-all duration-300">
      {/* Image or gradient placeholder */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={destination.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass}`} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-card-overlay group-hover:opacity-90 transition-opacity" />

      {/* Popular badge */}
      {destination.is_popular && (
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-brand-wine/90 px-2.5 py-1 text-xs font-semibold text-white">
          <Star className="h-3 w-3 fill-current" />
          Popular
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-1.5 text-brand-rose text-xs font-medium mb-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{destination.country}</span>
          <span className="text-brand-steel">·</span>
          <span className="text-brand-silver">{destination.continent}</span>
        </div>
        <h3 className="font-display text-lg font-bold text-white leading-tight">{destination.name}</h3>
        {destination.best_season && (
          <p className="text-xs text-brand-silver mt-1">Mejor época: {destination.best_season}</p>
        )}
      </div>
    </Link>
  )
}

export function DestinationCardSkeleton() {
  return (
    <div className="h-72 rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden animate-pulse">
      <div className="absolute bottom-4 left-4 space-y-2">
        <div className="h-3 w-20 bg-brand-steel/20 rounded" />
        <div className="h-5 w-36 bg-brand-steel/20 rounded" />
      </div>
    </div>
  )
}
