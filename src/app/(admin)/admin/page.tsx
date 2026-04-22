'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Package,
  Hotel,
  CalendarCheck,
  Star,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  href,
  color = 'wine',
}: {
  label: string
  value: string | number
  icon: typeof MapPin
  sub?: string
  href: string
  color?: 'wine' | 'steel' | 'rose'
}) {
  const colorMap = {
    wine: 'bg-brand-wine/10 text-brand-rose border-brand-wine/20',
    steel: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20',
    rose: 'bg-brand-rose/10 text-brand-rose border-brand-rose/20',
  }
  return (
    <Link
      href={href}
      className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 hover:border-brand-wine/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-brand-steel group-hover:text-brand-wine transition-colors" />
      </div>
      <p className="font-display text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-brand-silver font-medium">{label}</p>
      {sub && <p className="text-xs text-brand-steel mt-0.5">{sub}</p>}
    </Link>
  )
}

export default function AdminDashboardPage() {
  const { data: bookings = [] } = useQuery({
    queryKey: [...queryKeys.bookings.all, 'admin-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.bookings, { params: { page_size: 100 } })
      if ('results' in data) return data.results?.reservas ?? data.results ?? []
      return data.reservas ?? []
    },
    staleTime: 2 * 60 * 1000,
  })

  const pending = bookings.filter((b) => b.status === 'pending').length
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length
  const revenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + parseFloat(b.total_amount), 0)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Panel de control</p>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Revenue highlight */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-wine/20 via-brand-dark to-brand-dark border border-brand-wine/20 p-6 flex items-center justify-between">
        <div>
          <p className="text-brand-steel text-sm mb-1">Ingresos totales</p>
          <p className="font-display text-4xl font-bold text-white">{formatPrice(revenue)}</p>
          <p className="text-brand-silver text-sm mt-1">
            {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <TrendingUp className="h-16 w-16 text-brand-wine/30" />
      </div>

      {/* Booking status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pendientes', count: pending, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Confirmadas', count: confirmed, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
          { label: 'Canceladas', count: bookings.filter((b) => b.status === 'cancelled').length, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
          { label: 'Completadas', count: bookings.filter((b) => b.status === 'completed').length, color: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
            <p className="text-2xl font-bold font-display">{count}</p>
            <p className="text-xs font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-white mb-4">Gestión rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Destinos" value="Gestionar" icon={MapPin} href={ROUTES.admin.destinations} />
          <StatCard label="Paquetes" value="Gestionar" icon={Package} href={ROUTES.admin.packages} color="rose" />
          <StatCard label="Hoteles" value="Gestionar" icon={Hotel} href={ROUTES.admin.hotels} color="steel" />
          <StatCard label="Reservas" value={bookings.length} icon={CalendarCheck} sub={`${pending} pendientes`} href={ROUTES.admin.bookings} />
          <StatCard label="Actividades" value="Gestionar" icon={Zap} href={ROUTES.admin.activities} color="steel" />
          <StatCard label="Reseñas" value="Moderar" icon={Star} href={ROUTES.admin.reviews} color="rose" />
        </div>
      </div>

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Reservas recientes</h2>
            <Link href={ROUTES.admin.bookings} className="text-xs text-brand-silver hover:text-white transition-colors flex items-center gap-1">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider">N° Reserva</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider hidden sm:table-cell">Salida</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider">Estado</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {bookings.slice(0, 8).map((b) => {
                  const statusColors: Record<string, string> = {
                    pending: 'text-amber-400',
                    confirmed: 'text-emerald-400',
                    cancelled: 'text-red-400',
                    completed: 'text-brand-steel',
                  }
                  const statusLabels: Record<string, string> = {
                    pending: 'Pendiente',
                    confirmed: 'Confirmada',
                    cancelled: 'Cancelada',
                    completed: 'Completada',
                  }
                  return (
                    <tr key={b.id} className="hover:bg-brand-steel/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-brand-silver">#{b.booking_number}</td>
                      <td className="px-5 py-3 text-brand-silver hidden sm:table-cell">
                        {b.travel_date ?? '—'}
                      </td>
                      <td className={`px-5 py-3 text-xs font-medium ${statusColors[b.status]}`}>
                        {statusLabels[b.status]}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-white">
                        {formatPrice(b.total_amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
