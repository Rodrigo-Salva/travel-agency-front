'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  CreditCard, Search, Loader2, Download, TrendingUp,
  ChevronLeft, ChevronRight, ExternalLink, DollarSign,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

interface BookingPayment {
  id: number
  booking_number: string
  travel_date: string | null
  booking_date: string
  total_amount: string
  paid_amount: string
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  status: string
  customer: { first_name: string; last_name: string; email: string } | null
}

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'No pagado', partial: 'Parcial', paid: 'Pagado', refunded: 'Reembolsado',
}
const PAYMENT_COLORS: Record<string, string> = {
  unpaid:   'text-red-400 bg-red-500/10 border-red-500/20',
  partial:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
  paid:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  refunded: 'text-brand-steel bg-brand-steel/10 border-brand-steel/20',
}

const PAGE_SIZE = 12

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-brand-steel/10">
      <p className="text-xs text-brand-steel">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...' ? <span key={`e${i}`} className="px-2 text-brand-steel text-xs">…</span> : (
              <button key={p} onClick={() => onChange(p as number)}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-brand-wine text-white' : 'text-brand-steel hover:text-white hover:bg-brand-steel/10'}`}>
                {p}
              </button>
            )
          )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function exportCSV(bookings: BookingPayment[]) {
  const headers = ['N° Reserva', 'Cliente', 'Email', 'Fecha reserva', 'Fecha viaje', 'Total', 'Pagado', 'Estado pago', 'Estado reserva']
  const rows = bookings.map(b => [
    b.booking_number,
    b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : '—',
    b.customer?.email ?? '—',
    formatDate(b.booking_date),
    b.travel_date ? formatDate(b.travel_date) : '—',
    b.total_amount,
    b.paid_amount,
    PAYMENT_LABELS[b.payment_status] ?? b.payment_status,
    b.status,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pagos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial' | 'refunded'>('all')

  const { data, isLoading } = useQuery<{ bookings: BookingPayment[]; count: number; total_paid: number }>({
    queryKey: ['admin-payments', page, search, filter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filter !== 'all') params.payment_status = filter
      const { data } = await apiClient.get(API.bookings, { params })
      let list: BookingPayment[] = []
      let count = 0
      if ('results' in data) {
        count = data.count ?? 0
        list = data.results?.reservas ?? data.results ?? []
      } else {
        list = data.reservas ?? []
        count = list.length
      }
      const total_paid = list
        .filter(b => b.payment_status === 'paid')
        .reduce((s, b) => s + parseFloat(b.paid_amount || '0'), 0)
      return { bookings: list, count, total_paid }
    },
    staleTime: 2 * 60 * 1000,
  })

  // KPIs: para calcularlos correctamente necesitamos todos los paid — usamos un query separado
  const { data: allPaid } = useQuery<{ total: number; count: number }>({
    queryKey: ['admin-payments-kpis'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.bookings, { params: { payment_status: 'paid', page_size: 500 } })
      const list: BookingPayment[] = ('results' in data)
        ? (data.results?.reservas ?? data.results ?? [])
        : (data.reservas ?? [])
      const total = list.reduce((s, b) => s + parseFloat(b.paid_amount || '0'), 0)
      return { total, count: list.length }
    },
    staleTime: 5 * 60 * 1000,
  })

  const bookings = data?.bookings ?? []
  const total = data?.count ?? 0

  const filters = [
    { key: 'all',      label: 'Todos' },
    { key: 'paid',     label: 'Pagados' },
    { key: 'unpaid',   label: 'No pagados' },
    { key: 'partial',  label: 'Parciales' },
    { key: 'refunded', label: 'Reembolsados' },
  ] as const

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Pagos</h1>
          <p className="text-brand-silver text-sm mt-1">{total} transacciones</p>
        </div>
        <button
          onClick={() => exportCSV(bookings)}
          disabled={bookings.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-wine/40 text-sm font-medium transition-colors disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-brand-wine/20 to-brand-dark border border-brand-wine/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-brand-rose" />
            <p className="text-brand-silver text-xs font-medium">Total recaudado</p>
          </div>
          <p className="font-display text-2xl font-bold text-white">{formatPrice(allPaid?.total ?? 0)}</p>
        </div>
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-brand-silver" />
            <p className="text-brand-silver text-xs font-medium">Pagos confirmados</p>
          </div>
          <p className="font-display text-2xl font-bold text-white">{allPaid?.count ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-brand-silver" />
            <p className="text-brand-silver text-xs font-medium">Pago promedio</p>
          </div>
          <p className="font-display text-2xl font-bold text-white">
            {allPaid?.count ? formatPrice((allPaid.total / allPaid.count).toFixed(2)) : '—'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input
            placeholder="Buscar por N° reserva o cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1) }}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-brand-wine text-white'
                  : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-wine" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay transacciones</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['N° Reserva', 'Cliente', 'Fecha', 'Total', 'Pagado', 'Estado pago', 'Reserva', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-brand-silver">
                      #{b.booking_number}
                    </td>
                    <td className="px-4 py-3">
                      {b.customer ? (
                        <div>
                          <p className="text-white text-sm">{b.customer.first_name} {b.customer.last_name}</p>
                          <p className="text-brand-steel text-xs">{b.customer.email}</p>
                        </div>
                      ) : (
                        <span className="text-brand-steel text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-silver text-xs whitespace-nowrap">
                      {formatDate(b.booking_date)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {formatPrice(b.total_amount)}
                    </td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${parseFloat(b.paid_amount) > 0 ? 'text-emerald-400' : 'text-brand-steel'}`}>
                      {parseFloat(b.paid_amount) > 0 ? formatPrice(b.paid_amount) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${PAYMENT_COLORS[b.payment_status]}`}>
                        {PAYMENT_LABELS[b.payment_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${b.status === 'confirmed' ? 'text-emerald-400' : b.status === 'cancelled' ? 'text-red-400' : 'text-brand-silver'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={ROUTES.admin.booking(b.id)}
                        className="flex items-center gap-1 text-xs text-brand-silver hover:text-brand-wine transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
