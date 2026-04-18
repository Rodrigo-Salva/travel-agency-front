'use client'

import { use, useState } from 'react'
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
} from 'lucide-react'
import { usePackage } from '@/features/packages/hooks/usePackages'
import { ReviewList } from '@/features/reviews/components/ReviewList'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice, formatDate, formatDuration } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'

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

export default function PackageDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: pkg, isLoading, isError } = usePackage(id)

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

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="relative h-[440px] bg-brand-dark overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={pkg.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-wine/20 via-brand-dark to-brand-darkest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-brand-darkest/50 to-transparent" />

        {/* Back */}
        <div className="absolute top-6 left-0 right-0 container mx-auto px-4">
          <Link
            href={ROUTES.packages}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors bg-brand-darkest/60 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos los paquetes
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {pkg.is_featured && (
              <Badge className="bg-brand-wine/90 border-0 text-white flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Destacado
              </Badge>
            )}
            <Badge variant="secondary" className="bg-brand-darkest/80 border-brand-steel/20 text-brand-silver">
              {pkg.category.name}
            </Badge>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">{pkg.name}</h1>
          <div className="flex items-center gap-2 text-brand-rose text-sm font-medium">
            <MapPin className="h-4 w-4" />
            {pkg.destination}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
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

            {/* Reviews */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-brand-wine" />
                Reseñas
              </h2>
              <ReviewList packageId={pkg.id} />
            </div>
          </div>

          {/* Sidebar — price & booking */}
          <aside className="space-y-5">
            {/* Price card */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 sticky top-6">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Precio por persona</p>
              <p className="font-display text-4xl font-bold text-white mb-1">
                {formatPrice(pkg.price_adult)}
              </p>
              {pkg.price_child && parseFloat(pkg.price_child) > 0 && (
                <p className="text-sm text-brand-silver mb-5">
                  Niños: {formatPrice(pkg.price_child)}
                </p>
              )}

              <div className="space-y-3 mb-6 border-t border-brand-steel/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-steel">Duracion</span>
                  <span className="text-white font-medium">{pkg.duration_days}d / {pkg.duration_nights}n</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-steel">Min. personas</span>
                  <span className="text-white font-medium">{pkg.min_people}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-steel">Max. personas</span>
                  <span className="text-white font-medium">{pkg.max_people}</span>
                </div>
              </div>

              <Link
                href={`${ROUTES.customer.newBooking}?package=${pkg.id}`}
                className="block w-full text-center px-6 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Reservar ahora
              </Link>
              <p className="text-center text-xs text-brand-steel mt-3">Sin cargos adicionales ocultos</p>
            </div>

            {/* Category */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Categoria</h3>
              <p className="text-brand-silver text-sm">{pkg.category.name}</p>
              {pkg.category.description && (
                <p className="text-brand-steel text-xs mt-1">{pkg.category.description}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
