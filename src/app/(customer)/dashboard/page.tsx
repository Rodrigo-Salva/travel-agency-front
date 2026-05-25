'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck, Package, Clock, CheckCircle2, XCircle,
  MapPin, ArrowRight, User, Star, Heart, Plane, Sparkles,
} from 'lucide-react'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'
import type { BookingStatus, Booking } from '@/features/bookings/types/booking.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

function NextTripCard({ booking }: { booking: Booking }) {
  const days = booking.travel_date ? daysUntil(booking.travel_date) : null
  const imageUrl = booking.package_image
    ? booking.package_image.startsWith('http') ? booking.package_image : `${BASE_URL}${booking.package_image}`
    : null

  return (
    <div className="rounded-2xl overflow-hidden border border-brand-wine/25 card-depth bg-brand-dark relative">
      {/* Background image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <Image src={imageUrl} alt={booking.package_name ?? 'Viaje'} fill className="object-cover opacity-20" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/60" />
        </div>
      )}

      <div className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-wine/20 border border-brand-wine/30 flex items-center justify-center flex-shrink-0">
          <Plane className="h-6 w-6 text-brand-rose" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="section-label mb-1">Próximo viaje</p>
          <h3 className="font-display text-xl font-bold text-white truncate">{booking.package_name ?? 'Paquete de viaje'}</h3>
          {booking.travel_date && (
            <p className="text-brand-silver/70 text-sm mt-1 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              {formatDate(booking.travel_date)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1 flex-shrink-0">
          {days !== null && days >= 0 && (
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-white leading-none">{days}</p>
              <p className="text-brand-steel text-xs uppercase tracking-wider">{days === 1 ? 'día' : 'días'}</p>
            </div>
          )}
          {days !== null && days < 0 && (
            <span className="text-xs text-brand-steel bg-brand-darkest border border-brand-steel/20 rounded-full px-3 py-1">En curso</span>
          )}
          <Link href={ROUTES.customer.booking(booking.id)}
            className="mt-2 flex items-center gap-1 text-xs text-brand-rose hover:text-white transition-colors font-semibold">
            Ver detalle <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  pending:   { label: 'Pendiente',  classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',    icon: Clock },
  confirmed: { label: 'Confirmada', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelada',  classes: 'bg-red-500/10 text-red-400 border-red-500/20',          icon: XCircle },
  completed: { label: 'Completada', classes: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20', icon: CheckCircle2 },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: () => bookingsApi.list(),
    staleTime: 2 * 60 * 1000,
  })

  const pending   = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const recent    = bookings.slice(0, 3)

  // Próximo viaje: reserva confirmada con travel_date futura más cercana
  const nextTrip = bookings
    .filter(b => (b.status === 'confirmed' || b.status === 'pending') && b.travel_date && daysUntil(b.travel_date) >= 0)
    .sort((a, b) => new Date(a.travel_date!).getTime() - new Date(b.travel_date!).getTime())[0] ?? null

  const firstName = user?.nombre_completo?.split(' ')[0] ?? 'Viajero'
  const initials  = user?.nombre_completo
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-brand-dark via-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-wine/20 border border-brand-wine/30 flex items-center justify-center text-brand-rose font-bold text-xl flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-brand-steel text-sm">Bienvenido de vuelta</p>
              <h1 className="font-display text-3xl font-bold text-white">{firstName}</h1>
              <p className="text-brand-silver text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">

        {/* Próximo viaje */}
        {!isLoading && nextTrip && <NextTripCard booking={nextTrip} />}

        {/* CTA si no hay reservas */}
        {!isLoading && bookings.length === 0 && (
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-7 w-7 text-brand-rose" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-white text-lg mb-1">¡Planifica tu primer viaje!</h3>
              <p className="text-brand-silver/70 text-sm">Explora nuestros paquetes y reserva la aventura de tu vida.</p>
            </div>
            <Link href={ROUTES.packages} className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold text-sm hover:bg-brand-wine/90 transition-colors">
              Ver paquetes
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total reservas', value: bookings.length, color: 'text-white',         bg: 'bg-brand-dark',         icon: CalendarCheck },
            { label: 'Pendientes',     value: pending,         color: 'text-amber-400',     bg: 'bg-amber-500/5',        icon: Clock },
            { label: 'Confirmadas',    value: confirmed,       color: 'text-emerald-400',   bg: 'bg-emerald-500/5',      icon: CheckCircle2 },
            { label: 'Completadas',    value: completed,       color: 'text-brand-silver',  bg: 'bg-brand-steel/5',      icon: Star },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`rounded-2xl border border-brand-steel/10 p-5 ${bg}`}>
              <Icon className={`h-5 w-5 mb-3 ${color}`} />
              <p className={`font-display text-3xl font-bold ${color}`}>{isLoading ? '—' : value}</p>
              <p className="text-brand-steel text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent bookings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Reservas recientes</h2>
              <Link href={ROUTES.customer.bookings} className="text-xs text-brand-silver hover:text-white transition-colors flex items-center gap-1">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-brand-dark animate-pulse" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-10 flex flex-col items-center text-center gap-3">
                <Package className="h-12 w-12 text-brand-steel/30" />
                <p className="text-brand-silver text-sm">Aun no tienes reservas</p>
                <Link
                  href={ROUTES.packages}
                  className="px-4 py-2 rounded-xl bg-brand-wine text-white text-xs font-semibold hover:bg-brand-wine/90 transition-colors"
                >
                  Explorar paquetes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(b => {
                  const st = STATUS_CONFIG[b.status]
                  const Icon = st.icon
                  return (
                    <div key={b.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-4 hover:border-brand-wine/20 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-brand-steel">#{b.booking_number}</span>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${st.classes}`}>
                          <Icon className="h-3 w-3" />
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-brand-silver">
                          {b.travel_date && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-brand-wine" />
                              {formatDate(b.travel_date)}
                            </span>
                          )}
                        </div>
                        <p className="font-display font-bold text-white">{formatPrice(b.total_amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h2 className="font-semibold text-white">Accesos rápidos</h2>
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden divide-y divide-brand-steel/10">
              {[
                { label: 'Mis reservas',     href: ROUTES.customer.bookings,  icon: CalendarCheck, desc: 'Ver y gestionar' },
                { label: 'Lista de deseos',  href: ROUTES.customer.wishlist,  icon: Heart,         desc: 'Paquetes guardados' },
                { label: 'Mis reseñas',      href: ROUTES.customer.reviews,   icon: Star,          desc: 'Ver mis opiniones' },
                { label: 'Explorar destinos',href: ROUTES.destinations,       icon: MapPin,        desc: 'Buscar destinos' },
                { label: 'Ver paquetes',     href: ROUTES.packages,           icon: Package,       desc: 'Todos los paquetes' },
                { label: 'Mi perfil',        href: ROUTES.customer.profile,   icon: User,          desc: 'Editar datos' },
              ].map(({ label, href, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-brand-steel/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-wine/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-brand-rose" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-brand-steel text-xs">{desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-steel group-hover:text-brand-wine transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
