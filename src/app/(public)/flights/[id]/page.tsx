'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Plane, Clock, Users, Briefcase, ChevronRight,
  MapPin, Calendar, Tag, Info, Zap,
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice } from '@/lib/utils/format'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ROUTES } from '@/lib/constants/routes'

interface Flight {
  id: number
  airline_name: string
  airline_code: string
  flight_number: string
  origin_city: string
  destination_city: string
  origin_airport: string
  destination_airport: string
  departure_time: string
  arrival_time: string
  duration: string | null
  flight_class: string
  price: string
  available_seats: number
  baggage_allowance: string | null
  created_at: string
}

interface Props {
  params: Promise<{ id: string }>
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FlightDetailPage({ params }: Props) {
  const { id } = use(params)

  const { data: flight, isLoading, isError } = useQuery<Flight>({
    queryKey: ['flight', id],
    queryFn: async () => {
      const { data } = await apiClient.get(API.flight(Number(id)))
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest animate-pulse">
        <div className="h-56 bg-brand-dark" />
        <div className="container mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-64 bg-brand-steel/20 rounded" />
          <div className="h-4 w-full max-w-2xl bg-brand-steel/10 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !flight) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <Zap className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Vuelo no encontrado</h2>
        <Link href={ROUTES.flights} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a vuelos
        </Link>
      </div>
    )
  }

  const seatsColor = flight.available_seats > 20
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : flight.available_seats > 5
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-brand-darkest/90 backdrop-blur-md border-b border-brand-steel/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={ROUTES.flights} className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Todos los vuelos
          </Link>
          <span className="text-xs font-mono text-brand-steel">{flight.airline_code} {flight.flight_number}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Vuelos', href: ROUTES.flights }, { label: `${flight.origin_city} → ${flight.destination_city}` }]} />

          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-brand-rose text-xs font-bold uppercase tracking-widest mb-2">{flight.airline_name}</p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white">
                {flight.origin_city}
                <span className="mx-4 text-brand-wine">→</span>
                {flight.destination_city}
              </h1>
              <p className="text-brand-steel text-sm mt-2 capitalize">{flight.flight_class}</p>
            </div>
            <div className="text-right">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Precio por persona</p>
              <p className="font-display text-4xl font-bold text-white">{formatPrice(flight.price)}</p>
            </div>
          </div>

          {/* Route visual */}
          <div className="rounded-2xl bg-brand-dark/60 border border-brand-steel/15 p-6 max-w-3xl">
            <div className="flex items-center gap-4">
              {/* Origin */}
              <div className="flex-1 text-center">
                <p className="font-display text-5xl font-bold text-white leading-none mb-1">
                  {fmtTime(flight.departure_time)}
                </p>
                <p className="text-brand-silver font-semibold text-lg">{flight.origin_city}</p>
                <p className="text-brand-steel text-sm">{flight.origin_airport}</p>
                <p className="text-brand-steel/70 text-xs mt-1">{fmtDate(flight.departure_time)}</p>
              </div>

              {/* Line */}
              <div className="flex-1 flex flex-col items-center gap-2 min-w-[100px]">
                {flight.duration && (
                  <div className="flex items-center gap-1 text-xs text-brand-steel">
                    <Clock className="h-3 w-3" />
                    {flight.duration}
                  </div>
                )}
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px bg-brand-steel/25" />
                  <div className="w-8 h-8 rounded-full bg-brand-wine/15 border border-brand-wine/30 flex items-center justify-center">
                    <Plane className="h-4 w-4 text-brand-wine rotate-90" />
                  </div>
                  <div className="flex-1 h-px bg-brand-steel/25" />
                </div>
                <p className="text-xs text-emerald-400 font-medium">Vuelo directo</p>
              </div>

              {/* Destination */}
              <div className="flex-1 text-center">
                <p className="font-display text-5xl font-bold text-white leading-none mb-1">
                  {fmtTime(flight.arrival_time)}
                </p>
                <p className="text-brand-silver font-semibold text-lg">{flight.destination_city}</p>
                <p className="text-brand-steel text-sm">{flight.destination_airport}</p>
                <p className="text-brand-steel/70 text-xs mt-1">{fmtDate(flight.arrival_time)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Detalles del vuelo */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
              <h2 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Info className="h-5 w-5 text-brand-wine" /> Información del vuelo
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div>
                  <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Aerolínea</p>
                  <p className="text-white font-medium">{flight.airline_name}</p>
                  <p className="text-brand-steel text-xs font-mono">{flight.airline_code}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">N° de vuelo</p>
                  <p className="text-white font-medium font-mono">{flight.flight_number}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Clase</p>
                  <p className="text-white font-medium capitalize">{flight.flight_class}</p>
                </div>
                {flight.duration && (
                  <div>
                    <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Duración</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-brand-wine" />
                      <p className="text-white font-medium">{flight.duration}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Asientos disp.</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-wine" />
                    <p className="text-white font-medium">{flight.available_seats}</p>
                  </div>
                </div>
                {flight.baggage_allowance && (
                  <div>
                    <p className="text-xs text-brand-steel uppercase tracking-wider mb-1">Equipaje</p>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-brand-wine" />
                      <p className="text-white font-medium">{flight.baggage_allowance}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerario */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
              <h2 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-wine" /> Itinerario
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-brand-wine mt-1.5 flex-shrink-0" />
                    <div className="w-px flex-1 bg-brand-steel/20" />
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-brand-steel uppercase tracking-wider mb-0.5">Salida</p>
                    <p className="text-white font-semibold">{fmt(flight.departure_time)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-wine" />
                      <p className="text-brand-silver text-sm">{flight.origin_airport}, <span className="text-white font-medium">{flight.origin_city}</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-steel uppercase tracking-wider mb-0.5">Llegada</p>
                    <p className="text-white font-semibold">{fmt(flight.arrival_time)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      <p className="text-brand-silver text-sm">{flight.destination_airport}, <span className="text-white font-medium">{flight.destination_city}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Qué incluye */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-wine" /> ¿Qué incluye?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Briefcase, text: flight.baggage_allowance ?? 'Equipaje de mano incluido' },
                  { icon: Users, text: 'Asiento asignado' },
                  { icon: Plane, text: 'Vuelo directo sin escalas' },
                  { icon: Tag, text: 'Impuestos y tasas incluidos' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10">
                    <div className="w-8 h-8 rounded-lg bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-brand-rose" />
                    </div>
                    <span className="text-sm text-brand-silver">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Price + CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-wine/20 to-brand-dark border border-brand-wine/20 p-5">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Precio por persona</p>
              <p className="font-display text-3xl font-bold text-white mb-1">{formatPrice(flight.price)}</p>
              <p className="text-brand-steel text-xs mb-4 capitalize">Clase {flight.flight_class}</p>
              <Link
                href={`${ROUTES.contact}?vuelo=${encodeURIComponent(`${flight.airline_name} ${flight.flight_number} — ${flight.origin_city} → ${flight.destination_city}`)}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Reservar vuelo
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.packages}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white hover:bg-brand-dark mt-2 transition-colors"
              >
                Ver paquetes con vuelo
              </Link>
            </div>

            {/* Disponibilidad */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Disponibilidad</h3>
              <div className={`flex items-center justify-between p-3 rounded-xl border ${seatsColor}`}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Asientos disponibles</span>
                </div>
                <span className="font-bold text-lg">{flight.available_seats}</span>
              </div>
              {flight.available_seats <= 5 && (
                <p className="text-xs text-red-400 mt-2 text-center">¡Últimos asientos disponibles!</p>
              )}
            </div>

            {/* Info rápida */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Detalles</h3>
              <div className="flex items-center gap-3 text-sm">
                <Plane className="h-4 w-4 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Aerolínea</p>
                  <p className="text-white">{flight.airline_name} · <span className="font-mono">{flight.flight_number}</span></p>
                </div>
              </div>
              {flight.duration && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-brand-wine flex-shrink-0" />
                  <div>
                    <p className="text-brand-steel text-xs">Duración</p>
                    <p className="text-white">{flight.duration}</p>
                  </div>
                </div>
              )}
              {flight.baggage_allowance && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-brand-wine flex-shrink-0" />
                  <div>
                    <p className="text-brand-steel text-xs">Equipaje</p>
                    <p className="text-white">{flight.baggage_allowance}</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
