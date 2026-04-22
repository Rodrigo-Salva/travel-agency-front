'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Search, Loader2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { BookingStatus, PaymentStatus } from '@/features/bookings/types/booking.types'

const PAGE_SIZE = 8

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}
const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
  completed: 'text-brand-silver bg-brand-steel/10 border-brand-steel/20',
}
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'No pagado', partial: 'Parcial', paid: 'Pagado', refunded: 'Reembolsado',
}
const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: 'text-red-400', partial: 'text-amber-400', paid: 'text-emerald-400', refunded: 'text-brand-steel',
}

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
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
            p === '...' ? (
              <span key={`e${i}`} className="px-2 text-brand-steel text-xs">…</span>
            ) : (
              <button key={p} onClick={() => onChange(p as number)}
                className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-brand-wine text-white' : 'text-brand-steel hover:text-white hover:bg-brand-steel/10'}`}>
                {p}
              </button>
            )
          )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface BookingSummary {
  id: number
  booking_number: string
  travel_date: string | null
  num_adults: number
  num_children: number
  status: BookingStatus
  payment_status: PaymentStatus
  total_amount: string
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ bookings: BookingSummary[]; count: number }>({
    queryKey: [...queryKeys.bookings.all, 'admin', page, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await apiClient.get(API.bookings, { params })
      if ('results' in data) {
        return { count: data.count ?? 0, bookings: data.results?.reservas ?? data.results ?? [] }
      }
      const list = data.reservas ?? []
      return { count: list.length, bookings: list }
    },
    staleTime: 2 * 60 * 1000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(API.cancelBooking(id), {}),
    onSuccess: () => {
      toast.success('Reserva cancelada')
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all })
    },
    onError: () => toast.error('No se pudo cancelar'),
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStatus = (s: BookingStatus | '') => { setStatusFilter(s); setPage(1) }

  const bookings = data?.bookings ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Reservas</h1>
        <p className="text-brand-silver text-sm mt-1">{total} reservas en total</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input
            placeholder="Buscar por N° reserva o cliente..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand-wine text-white'
                  : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'
              }`}
            >
              {s === '' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-wine" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay reservas</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['N° Reserva', 'Salida', 'Pasajeros', 'Estado', 'Pago', 'Total', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-brand-silver">#{b.booking_number}</td>
                    <td className="px-4 py-3 text-brand-silver whitespace-nowrap">
                      {b.travel_date ? formatDate(b.travel_date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-brand-silver">
                      {b.num_adults}A{b.num_children > 0 ? ` ${b.num_children}N` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[b.status]}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${PAYMENT_COLORS[b.payment_status]}`}>
                      {PAYMENT_LABELS[b.payment_status]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {formatPrice(b.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => cancelMutation.mutate(b.id)}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          {cancelMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Cancelar
                        </button>
                      )}
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
