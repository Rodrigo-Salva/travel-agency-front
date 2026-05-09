'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Package,
  Hotel,
  CalendarCheck,
  Star,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Metrics {
  exito: boolean
  totales: {
    reservas: number
    ingresos: number
    usuarios: number
    nuevos_este_mes: number
    reseñas_pendientes: number
    calificacion_promedio: number
  }
  estados: {
    pending: number
    confirmed: number
    cancelled: number
    completed: number
  }
  ingresos_mensuales: { month: string; revenue: number; bookings: number }[]
  top_paquetes: { name: string; bookings: number; revenue: number }[]
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  icon: typeof TrendingUp
  accent?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-gradient-to-br from-brand-wine/20 to-brand-dark border-brand-wine/30' : 'bg-brand-dark border-brand-steel/10'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-brand-wine/20 text-brand-rose' : 'bg-brand-steel/10 text-brand-silver'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-brand-silver font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-brand-steel mt-0.5">{sub}</p>}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, sub, href, color = 'wine' }: {
  label: string; value: string | number; icon: typeof MapPin; sub?: string; href: string; color?: 'wine' | 'steel' | 'rose'
}) {
  const colorMap = {
    wine: 'bg-brand-wine/10 text-brand-rose border-brand-wine/20',
    steel: 'bg-brand-steel/10 text-brand-silver border-brand-steel/20',
    rose: 'bg-brand-rose/10 text-brand-rose border-brand-rose/20',
  }
  return (
    <Link href={href} className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 hover:border-brand-wine/30 transition-all group">
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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-brand-dark border border-brand-steel/20 px-3 py-2 text-xs shadow-xl">
      <p className="text-brand-silver mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-semibold">
          {p.dataKey === 'revenue' ? formatPrice(p.value) : `${p.value} reservas`}
        </p>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.adminMetrics)
      return data
    },
    staleTime: 2 * 60 * 1000,
  })

  const t = data?.totales
  const estados = data?.estados
  const monthlyData = data?.ingresos_mensuales?.map((m) => ({
    ...m,
    label: m.month.slice(0, 7),
  })) ?? []
  const topPackages = data?.top_paquetes ?? []

  const statusItems = [
    { label: 'Pendientes', count: estados?.pending ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Confirmadas', count: estados?.confirmed ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Canceladas', count: estados?.cancelled ?? 0, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Completadas', count: estados?.completed ?? 0, color: 'text-brand-silver', bg: 'bg-brand-steel/10 border-brand-steel/20' },
  ]

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-brand-steel text-sm">Cargando métricas...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Panel de control</p>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos totales" value={formatPrice(t?.ingresos ?? 0)} icon={TrendingUp} accent />
        <KpiCard label="Total reservas" value={t?.reservas ?? 0} sub={`${estados?.pending ?? 0} pendientes`} icon={CalendarCheck} />
        <KpiCard label="Clientes" value={t?.usuarios ?? 0} sub={`+${t?.nuevos_este_mes ?? 0} este mes`} icon={Users} />
        <KpiCard
          label="Reseñas pendientes"
          value={t?.reseñas_pendientes ?? 0}
          sub={`Promedio: ${t?.calificacion_promedio ?? 0} ★`}
          icon={AlertCircle}
        />
      </div>

      {/* Booking status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusItems.map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold font-display ${color}`}>{count}</p>
            <p className={`text-xs font-medium mt-1 ${color}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
          <h2 className="font-semibold text-white mb-4 text-sm">Ingresos mensuales</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b1c3a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9b1c3a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#c42c54" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-brand-steel text-xs">Sin datos de ingresos aún</div>
          )}
        </div>

        {/* Top packages bar chart */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
          <h2 className="font-semibold text-white mb-4 text-sm">Top 5 paquetes</h2>
          {topPackages.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topPackages} layout="vertical" margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: '#9494b0', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" fill="#9b1c3a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-brand-steel text-xs">Sin datos de paquetes aún</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-white mb-4">Gestión rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Destinos" value="Gestionar" icon={MapPin} href={ROUTES.admin.destinations} />
          <StatCard label="Paquetes" value="Gestionar" icon={Package} href={ROUTES.admin.packages} color="rose" />
          <StatCard label="Hoteles" value="Gestionar" icon={Hotel} href={ROUTES.admin.hotels} color="steel" />
          <StatCard label="Reservas" value={t?.reservas ?? 0} icon={CalendarCheck} sub={`${estados?.pending ?? 0} pendientes`} href={ROUTES.admin.bookings} />
          <StatCard label="Actividades" value="Gestionar" icon={Zap} href={ROUTES.admin.activities} color="steel" />
          <StatCard label="Reseñas" value={`${t?.reseñas_pendientes ?? 0} pendientes`} icon={Star} href={ROUTES.admin.reviews} color="rose" />
        </div>
      </div>
    </div>
  )
}
