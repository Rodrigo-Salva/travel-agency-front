'use client'

import { use, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  Plane,
  Hotel,
  UtensilsCrossed,
  Car,
  UserCheck,
  MessageSquare,
  Share2,
  Check,
} from 'lucide-react'
import { usePackage } from '@/features/packages/hooks/usePackages'
import { ReviewList } from '@/features/reviews/components/ReviewList'
import { PackageGallery } from '@/components/packages/PackageGallery'
import { RelatedPackages } from '@/components/packages/RelatedPackages'
import { RecentlyViewed } from '@/components/ui/RecentlyViewed'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice, formatDate, formatDuration } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { PriceCalculator } from '@/features/packages/components/PriceCalculator'

const DestinationMap = dynamic(
  () => import('@/features/destinations/components/DestinationMap').then((m) => m.DestinationMap),
  { ssr: false, loading: () => <div className="h-[380px] rounded-2xl bg-brand-dark animate-pulse" /> },
)

interface Props {
  params: Promise<{ id: string }>
}

function IncludeItem({ label, included, icon }: { label: string; included: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2.5 text-sm ${included ? 'text-white' : 'text-brand-steel line-through'}`}>
      {included
        ? <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        : <XCircle className="h-4 w-4 text-brand-steel/50 flex-shrink-0" />
      }
      <span className="flex items-center gap-1.5">{icon}{label}</span>
    </div>
  )
}

function ItineraryDayCard({ day }: { day: { day_number: number; title: string; description: string; activities: string[]; meals_included: string[] } }) {
  const [open, setOpen] = useState(day.day_number === 1)
  return (
    <div className="border border-brand-steel/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-brand-dark hover:bg-brand-steel/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-brand-wine/20 border border-brand-wine/30 flex items-center justify-center text-xs font-bold text-brand-rose">
            {day.day_number}
          </span>
          <span className="font-semibold text-white text-sm">{day.title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-brand-steel" /> : <ChevronDown className="h-4 w-4 text-brand-steel" />}
      </button>

      {open && (
        <div className="p-4 bg-brand-darkest/50 space-y-3 border-t border-brand-steel/10">
          <p className="text-brand-silver text-sm leading-relaxed">{day.description}</p>

          {day.activities?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2">Actividades</p>
              <ul className="space-y-1">
                {day.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-silver">
                    <span className="text-brand-wine mt-0.5">•</span>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {day.meals_included?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-2">Comidas incluidas</p>
              <div className="flex flex-wrap gap-1.5">
                {day.meals_included.map((meal, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-brand-dark border border-brand-steel/20 text-brand-silver">
                    {meal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PackageDetailClient({ params }: Props) {
  const { id } = use(params)
  const { data: pkg, isLoading, isError } = usePackage(id)
  const [copied, setCopied] = useState(false)
  const { add: trackView } = useRecentlyViewed()

  const BASE_URL_TRACK = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

  useEffect(() => {
    if (!pkg) return
    const img = pkg.image
      ? pkg.image.startsWith('http') ? pkg.image : `${BASE_URL_TRACK}${pkg.image}`
      : null
    trackView({
      id: pkg.id,
      type: 'package',
      name: pkg.name,
      image: img,
      subtitle: `Desde ${pkg.discounted_price_adult ?? pkg.price_adult} USD`,
      href: ROUTES.package(pkg.id),
    })
  }, [pkg?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: pkg?.name ?? 'Paquete de viaje', url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = pkg?.image
    ? pkg.image.startsWith('http')
      ? pkg.image
      : `${BASE_URL}${pkg.image}`
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

  if (isError || !pkg) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Paquete no encontrado</h2>
        <p className="text-brand-silver">El paquete que buscas no existe o fue eliminado.</p>
        <Link
          href={ROUTES.packages}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a paquetes
        </Link>
      </div>
    )
  }

  const galleryImages = [
    ...(imageUrl ? [imageUrl] : []),
    ...(pkg.images ?? []).map((img: { image: string }) => {
      const src = img.image
      return src.startsWith('http') ? src : `${BASE_URL}${src}`
    }),
  ]

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Top nav bar */}
      <div className="sticky top-0 z-20 bg-brand-darkest/90 backdrop-blur-md border-b border-brand-steel/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={ROUTES.packages} className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Todos los paquetes
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {pkg.is_featured && (
                <Badge className="bg-brand-wine/90 border-0 text-white flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Destacado
                </Badge>
              )}
              <Badge variant="secondary" className="bg-brand-dark border-brand-steel/20 text-brand-silver">
                {pkg.category.name}
              </Badge>
            </div>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-sm text-brand-silver hover:text-white transition-colors bg-brand-dark px-3 py-1.5 rounded-lg border border-brand-steel/20">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Compartir'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-4">
        <Breadcrumbs items={[{ label: 'Paquetes', href: ROUTES.packages }, { label: pkg.name }]} />
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">{pkg.name}</h1>
          <div className="flex items-center gap-2 text-brand-rose text-sm font-medium">
            <MapPin className="h-4 w-4" /> {pkg.destination}
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-10">
            <PackageGallery images={galleryImages} alt={pkg.name} />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-xs text-brand-steel">Duracion</p>
                  <p className="text-white text-sm font-semibold">{formatDuration(pkg.duration_days, pkg.duration_nights)}</p>
                </div>
              </div>
              <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-xs text-brand-steel">Grupo</p>
                  <p className="text-white text-sm font-semibold">{pkg.min_people}–{pkg.max_people} personas</p>
                </div>
              </div>
              {pkg.available_from && (
                <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-brand-wine flex-shrink-0" />
                  <div>
                    <p className="text-xs text-brand-steel">Disponible desde</p>
                    <p className="text-white text-sm font-semibold">{formatDate(pkg.available_from)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Descripcion</h2>
              <p className="text-brand-silver leading-relaxed text-base whitespace-pre-line">
                {pkg.description || pkg.short_description}
              </p>
            </div>

            {/* What's included */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-5">¿Que incluye?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 rounded-2xl bg-brand-dark border border-brand-steel/10">
                <IncludeItem label="Vuelo" included={pkg.includes_flight} icon={<Plane className="h-3.5 w-3.5" />} />
                <IncludeItem label="Hotel" included={pkg.includes_hotel} icon={<Hotel className="h-3.5 w-3.5" />} />
                <IncludeItem label="Comidas" included={pkg.includes_meals} icon={<UtensilsCrossed className="h-3.5 w-3.5" />} />
                <IncludeItem label="Transporte" included={pkg.includes_transport} icon={<Car className="h-3.5 w-3.5" />} />
                <IncludeItem label="Guia turístico" included={pkg.includes_guide} icon={<UserCheck className="h-3.5 w-3.5" />} />
              </div>
            </div>

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-5">Itinerario</h2>
                <div className="space-y-3">
                  {pkg.itinerary
                    .sort((a, b) => a.day_number - b.day_number)
                    .map((day) => (
                      <ItineraryDayCard key={day.id} day={day} />
                    ))}
                </div>
              </div>
            )}

            {/* Destination map */}
            {pkg.destination_latitude && pkg.destination_longitude && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-5 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-brand-wine" />
                  Ubicación del destino
                </h2>
                <DestinationMap
                  name={pkg.destination}
                  country={pkg.destination_country ?? ''}
                  latitude={Number(pkg.destination_latitude)}
                  longitude={Number(pkg.destination_longitude)}
                />
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-brand-wine" />
                Reseñas
              </h2>
              <ReviewList packageId={pkg.id} />
            </div>
          </div>

          {/* Sidebar — calculadora + info */}
          <aside className="space-y-5">
            {/* Price header */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 px-6 pt-5 pb-4">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Desde</p>
              {pkg.discount_percentage && parseFloat(String(pkg.discount_percentage)) > 0 ? (
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-brand-steel text-sm line-through">{formatPrice(pkg.price_adult)}</span>
                  <span className="bg-brand-wine/20 text-brand-rose text-xs font-bold px-2 py-0.5 rounded-full">
                    -{parseFloat(String(pkg.discount_percentage)).toFixed(0)}%
                  </span>
                  <p className="font-display text-3xl font-bold text-white w-full mt-0.5">
                    {formatPrice(pkg.discounted_price_adult ?? pkg.price_adult)}
                    <span className="text-sm font-normal text-brand-steel ml-1">/ adulto</span>
                  </p>
                </div>
              ) : (
                <p className="font-display text-3xl font-bold text-white">
                  {formatPrice(pkg.price_adult)}
                  <span className="text-sm font-normal text-brand-steel ml-1">/ adulto</span>
                </p>
              )}
              {pkg.price_child && parseFloat(pkg.price_child) > 0 && (
                <p className="text-sm text-brand-silver mt-1">
                  Niños: {formatPrice(pkg.price_child)} / persona
                </p>
              )}
            </div>

            {/* Calculadora interactiva */}
            <div className="sticky top-6">
              <PriceCalculator
                packageId={pkg.id}
                priceAdult={pkg.price_adult}
                priceChild={pkg.price_child}
                discountedPriceAdult={pkg.discounted_price_adult}
                discountPercentage={pkg.discount_percentage}
                minPeople={pkg.min_people}
                maxPeople={pkg.max_people}
                availableSpots={pkg.available_spots}
                isSoldOut={pkg.is_sold_out}
              />
            </div>

            {/* Duration + Category */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-steel">Duración</span>
                <span className="text-white font-medium">{pkg.duration_days}d / {pkg.duration_nights}n</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-steel">Categoría</span>
                <span className="text-white font-medium">{pkg.category.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-steel">Disponible hasta</span>
                <span className="text-white font-medium">{formatDate(pkg.available_until)}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Related packages */}
        <RelatedPackages currentId={pkg.id} destinationName={pkg.destination} />

        {/* Recently viewed */}
        <RecentlyViewed
          exclude={{ id: pkg.id, type: 'package' }}
          className="mt-14 border-t border-brand-steel/10 pt-10"
        />
      </div>
    </div>
  )
}
