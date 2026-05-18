import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { Hotel } from '../types/hotel.types'

interface Props { hotel: Hotel }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

export function HotelCard({ hotel }: Props) {
  const imageUrl = hotel.image
    ? hotel.image.startsWith('http') ? hotel.image : `${BASE_URL}${hotel.image}`
    : null

  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean).slice(0, 3)
    : []

  return (
    <Link href={ROUTES.hotel(hotel.id)}
      className="group rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden card-depth hover:card-depth-hover hover:border-brand-wine/35 hover:-translate-y-1 transition-all duration-300 flex flex-col">

      <div className="relative h-52 bg-brand-darkest overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={hotel.name} fill
            className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-brand-dark to-brand-darkest flex items-center justify-center">
            <Star className="h-12 w-12 text-brand-steel/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/90 via-brand-darkest/20 to-transparent" />
        <div className="absolute inset-0 bg-brand-wine/0 group-hover:bg-brand-wine/8 transition-colors duration-500" />

        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 rounded-full px-2.5 py-1">
            <StarRating rating={hotel.star_rating} />
          </div>
        </div>

        {(hotel.check_in_time || hotel.check_out_time) && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {hotel.check_in_time && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
                <Clock className="h-3 w-3" /> In: {hotel.check_in_time.slice(0, 5)}
              </span>
            )}
            {hotel.check_out_time && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
                Out: {hotel.check_out_time.slice(0, 5)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-brand-rose text-xs font-semibold mb-2 uppercase tracking-wide">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {hotel.destination?.name ?? '—'}{hotel.destination?.country ? `, ${hotel.destination.country}` : ''}
        </div>

        <h3 className="font-bold text-white text-sm leading-snug mb-1.5 group-hover:text-brand-rose transition-colors">{hotel.name}</h3>

        {hotel.address && <p className="text-xs text-brand-silver/70 line-clamp-1 mb-3">{hotel.address}</p>}

        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4 flex-1">
            {amenitiesList.map(a => (
              <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-darkest border border-brand-steel/15 text-brand-silver/80">{a}</span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between pt-3 border-t border-brand-steel/10 mt-auto">
          <div>
            <p className="text-[11px] text-brand-steel uppercase tracking-widest mb-0.5">Desde</p>
            <p className="font-display text-xl font-bold text-white leading-none">{formatPrice(hotel.price_per_night)}</p>
            <p className="text-[11px] text-brand-steel mt-1">por noche</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-wine/15 group-hover:bg-brand-wine border border-brand-wine/20 group-hover:border-brand-wine text-brand-rose group-hover:text-white transition-all duration-300">
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 card-depth overflow-hidden animate-pulse">
      <div className="h-52 bg-gradient-to-b from-brand-steel/10 to-brand-darkest/50" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-20 bg-brand-wine/20 rounded-full" />
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-brand-steel/10 rounded-full" />
          <div className="h-5 w-14 bg-brand-steel/10 rounded-full" />
        </div>
        <div className="h-px w-full bg-brand-steel/10" />
        <div className="flex justify-between items-end">
          <div className="h-6 w-24 bg-brand-steel/20 rounded" />
          <div className="h-10 w-10 bg-brand-wine/10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
