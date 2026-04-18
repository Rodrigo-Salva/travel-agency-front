import Image from 'next/image'
import { Star, MapPin, Clock, Wifi } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import type { Hotel } from '../types/hotel.types'

interface Props {
  hotel: Hotel
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/40'}`}
        />
      ))}
    </div>
  )
}

export function HotelCard({ hotel }: Props) {
  const imageUrl = hotel.image
    ? hotel.image.startsWith('http') ? hotel.image : `${BASE_URL}${hotel.image}`
    : null

  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map((a) => a.trim()).filter(Boolean).slice(0, 3)
    : []

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:border-brand-wine/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-brand-darkest overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={hotel.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-steel/10 to-brand-darkest flex items-center justify-center">
            <Star className="h-10 w-10 text-brand-steel/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <StarRating rating={hotel.star_rating} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-1.5 text-brand-wine text-xs font-medium mb-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          {hotel.destination.name}, {hotel.destination.country}
        </div>

        <h3 className="font-semibold text-white text-sm leading-snug mb-2">{hotel.name}</h3>

        {hotel.address && (
          <p className="text-xs text-brand-steel line-clamp-1 mb-2">{hotel.address}</p>
        )}

        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 flex-1">
            {amenitiesList.map((a) => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-brand-darkest border border-brand-steel/20 text-brand-silver">
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-brand-steel mb-3">
          {hotel.check_in_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Check-in: {hotel.check_in_time.slice(0, 5)}
            </span>
          )}
          {hotel.check_out_time && (
            <span>Check-out: {hotel.check_out_time.slice(0, 5)}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-brand-steel/10 mt-auto">
          <div>
            <p className="text-xs text-brand-steel">Desde</p>
            <p className="font-display text-lg font-bold text-white">
              {formatPrice(hotel.price_per_night)}
              <span className="text-xs font-normal text-brand-steel ml-1">/noche</span>
            </p>
          </div>
          <span className="text-xs text-brand-silver bg-brand-darkest border border-brand-steel/20 px-2.5 py-1 rounded-full">
            {hotel.total_rooms} hab.
          </span>
        </div>
      </div>
    </div>
  )
}

export function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden animate-pulse">
      <div className="h-48 bg-brand-steel/10" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-24 bg-brand-steel/20 rounded" />
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="h-3 w-full bg-brand-steel/10 rounded" />
        <div className="h-8 w-full bg-brand-wine/10 rounded mt-2" />
      </div>
    </div>
  )
}
