import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Globe } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { Destination } from '../types/destination.types'

interface Props { destination: Destination }

const PLACEHOLDER_GRADIENTS = [
  'from-brand-wine/40 via-brand-dark to-brand-darkest',
  'from-teal-900/60 via-brand-dark to-brand-darkest',
  'from-indigo-900/50 via-brand-dark to-brand-darkest',
  'from-amber-900/40 via-brand-dark to-brand-darkest',
]

export function DestinationCard({ destination }: Props) {
  const gradient = PLACEHOLDER_GRADIENTS[destination.id % PLACEHOLDER_GRADIENTS.length]
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = destination.image
    ? destination.image.startsWith('http') ? destination.image : `${BASE_URL}${destination.image}`
    : null

  return (
    <Link href={ROUTES.destination(destination.id)}
      className="group relative block h-80 rounded-2xl overflow-hidden border border-brand-steel/10 card-depth hover:card-depth-hover hover:border-brand-wine/35 hover:-translate-y-1 transition-all duration-300">

      {imageUrl ? (
        <Image src={imageUrl} alt={destination.name} fill
          className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="h-16 w-16 text-brand-steel/20" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/95 via-brand-darkest/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-darkest/40 to-transparent" />
      <div className="absolute inset-0 bg-brand-wine/0 group-hover:bg-brand-wine/10 transition-colors duration-500" />

      {destination.is_popular && (
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            <Star className="h-3 w-3 fill-white" /> Popular
          </span>
        </div>
      )}

      {destination.packages_count != null && destination.packages_count > 0 && (
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            {destination.packages_count} {destination.packages_count === 1 ? 'paquete' : 'paquetes'}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-1.5 text-brand-rose text-xs font-semibold mb-1.5 uppercase tracking-wide">
          <MapPin className="h-3.5 w-3.5" />
          <span>{destination.country}</span>
          {destination.continent && (
            <><span className="text-brand-steel/60">·</span><span className="text-brand-silver/70 font-normal normal-case tracking-normal">{destination.continent}</span></>
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-white leading-tight group-hover:text-brand-rose transition-colors">
          {destination.name}
        </h3>
        {destination.best_season && (
          <p className="text-xs text-brand-silver/70 mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-brand-rose/60" /> Mejor época: {destination.best_season}
          </p>
        )}
        <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-brand-wine to-brand-rose transition-all duration-500 mt-3 rounded-full" />
      </div>
    </Link>
  )
}

export function DestinationCardSkeleton() {
  return (
    <div className="h-80 rounded-2xl bg-brand-dark border border-brand-steel/10 card-depth overflow-hidden animate-pulse relative">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-steel/10 to-brand-darkest/50" />
      <div className="absolute bottom-5 left-5 space-y-2">
        <div className="h-2.5 w-20 bg-brand-wine/20 rounded-full" />
        <div className="h-6 w-40 bg-brand-steel/20 rounded" />
        <div className="h-2.5 w-28 bg-brand-steel/15 rounded" />
      </div>
    </div>
  )
}
