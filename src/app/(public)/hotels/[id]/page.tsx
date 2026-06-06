'use client'

import { use, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Clock, Phone, Mail, Wifi, Users, ChevronRight, MessageSquare, BedDouble, Coffee, Dumbbell, Car, Utensils, Waves, Wind, PocketKnife } from 'lucide-react'
import { useHotel } from '@/features/hotels/hooks/useHotels'
import { RecentlyViewed } from '@/components/ui/RecentlyViewed'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { InlineReviewSection } from '@/features/reviews/components/InlineReviewSection'
import { PackageGallery } from '@/components/packages/PackageGallery'

interface Props {
  params: Promise<{ id: string }>
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

export default function HotelDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: hotel, isLoading, isError } = useHotel(id)
  const { add: trackView } = useRecentlyViewed()
  const BASE_URL_TRACK = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

  useEffect(() => {
    if (!hotel) return
    const img = hotel.image
      ? hotel.image.startsWith('http') ? hotel.image : `${BASE_URL_TRACK}${hotel.image}`
      : null
    trackView({
      id: hotel.id,
      type: 'hotel',
      name: hotel.name,
      image: img,
      subtitle: hotel.price_per_night ? `Desde $${hotel.price_per_night}/noche` : undefined,
      href: ROUTES.hotel(hotel.id),
    })
  }, [hotel?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = hotel?.image
    ? hotel.image.startsWith('http') ? hotel.image : `${BASE_URL}${hotel.image}`
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest animate-pulse">
        <div className="h-80 bg-brand-dark" />
        <div className="container mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-64 bg-brand-steel/20 rounded" />
          <div className="h-4 w-full max-w-2xl bg-brand-steel/10 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !hotel) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <Star className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Hotel no encontrado</h2>
        <Link href={ROUTES.hotels} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a hoteles
        </Link>
      </div>
    )
  }

  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : []

  // Mapa de íconos por keyword en el nombre de la amenidad
  const AMENITY_ICONS: [RegExp, typeof Wifi][] = [
    [/wifi|internet/i, Wifi],
    [/gym|gimnasio|fitness/i, Dumbbell],
    [/piscina|pool|swim/i, Waves],
    [/estacionamiento|parking|garaje/i, Car],
    [/restaurante|restaurant|bar|comida/i, Utensils],
    [/desayuno|breakfast|café|cafe|coffee/i, Coffee],
    [/aire|ac|clima|air/i, Wind],
    [/habitaci|room|suite|cama/i, BedDouble],
  ]

  function getAmenityIcon(name: string) {
    for (const [rx, Icon] of AMENITY_ICONS) {
      if (rx.test(name)) return Icon
    }
    return PocketKnife
  }

  const galleryImages = [
    ...(imageUrl ? [imageUrl] : []),
    ...(hotel.images ?? []).map((img: { image: string }) => {
      const src = img.image
      return src.startsWith('http') ? src : `${BASE_URL}${src}`
    }),
  ]

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-brand-darkest/90 backdrop-blur-md border-b border-brand-steel/10">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href={ROUTES.hotels} className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Todos los hoteles
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-4">
        <Breadcrumbs items={[{ label: 'Hoteles', href: ROUTES.hotels }, { label: hotel.name }]} />
        {/* Title */}
        <div className="mb-6">
          <StarRating rating={hotel.star_rating} />
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mt-2 mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-2 text-brand-rose text-sm font-medium">
            <MapPin className="h-4 w-4" />
            {hotel.destination.name}, {hotel.destination.country}
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-10">
            <PackageGallery images={galleryImages} alt={hotel.name} />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {hotel.description && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Sobre el hotel</h2>
                <p className="text-brand-silver leading-relaxed">{hotel.description}</p>
              </div>
            )}

            {amenitiesList.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Amenidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenitiesList.map((amenity) => {
                    const AmenityIcon = getAmenityIcon(amenity)
                    return (
                      <div key={amenity} className="flex items-center gap-2 p-3 rounded-xl bg-brand-dark border border-brand-steel/10 text-sm text-brand-silver hover:border-brand-wine/20 transition-colors group">
                        <AmenityIcon className="h-4 w-4 text-brand-rose flex-shrink-0 group-hover:scale-110 transition-transform" />
                        {amenity}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Check-in / Check-out */}
            {(hotel.check_in_time || hotel.check_out_time) && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Horarios</h2>
                <div className="grid grid-cols-2 gap-4">
                  {hotel.check_in_time && (
                    <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4">
                      <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Check-in</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-brand-wine" />
                        <p className="text-white font-semibold text-lg">{hotel.check_in_time.slice(0, 5)}</p>
                      </div>
                    </div>
                  )}
                  {hotel.check_out_time && (
                    <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4">
                      <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Check-out</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-brand-steel" />
                        <p className="text-white font-semibold text-lg">{hotel.check_out_time.slice(0, 5)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-brand-wine" />
                Reseñas
              </h2>
              <InlineReviewSection label={`Reseña de ${hotel.name}`} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Price card */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-wine/20 to-brand-dark border border-brand-wine/20 p-5">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Precio por noche</p>
              <p className="font-display text-3xl font-bold text-white mb-1">{formatPrice(hotel.price_per_night)}</p>
              <p className="text-brand-steel text-xs mb-4">{hotel.total_rooms} habitaciones disponibles</p>
              <Link
                href={ROUTES.packages}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Ver paquetes con este hotel
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Informacion</h3>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-brand-wine mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Direccion</p>
                  <p className="text-white">{hotel.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Habitaciones</p>
                  <p className="text-white">{hotel.total_rooms} en total</p>
                </div>
              </div>

              {hotel.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-brand-wine flex-shrink-0" />
                  <div>
                    <p className="text-brand-steel text-xs">Telefono</p>
                    <p className="text-white">{hotel.phone}</p>
                  </div>
                </div>
              )}

              {hotel.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-brand-wine flex-shrink-0" />
                  <div>
                    <p className="text-brand-steel text-xs">Email</p>
                    <p className="text-white break-all">{hotel.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stars */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 text-center">
              <StarRating rating={hotel.star_rating} />
              <p className="text-brand-silver text-sm mt-2">Hotel {hotel.star_rating} estrellas</p>
              <Badge variant="secondary" className="mt-2 bg-brand-darkest border-brand-steel/20 text-brand-silver">
                {hotel.destination.continent}
              </Badge>
            </div>
          </aside>
        </div>

        {/* Recently viewed */}
        <RecentlyViewed
          exclude={{ id: hotel.id, type: 'hotel' }}
          className="mt-14 border-t border-brand-steel/10 pt-10"
        />
      </div>
    </div>
  )
}
