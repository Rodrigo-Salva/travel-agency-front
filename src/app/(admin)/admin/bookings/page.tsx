'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Search, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { BookingStatus, PaymentStatus } from '@/features/bookings/types/booking.types'

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

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const qc = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: () => bookingsApi.list(),
    staleTime: 60 * 1000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: (data) => {
      toast.success(data.mensaje)
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all })
    },
    onError: () => toast.error('No se pudo cancelar'),
  })

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || b.booking_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Reservas</h1>
        <p className="text-brand-silver text-sm mt-1">{bookings.length} reservas en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input
            placeholder="Buscar por N° reserva..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          />
        </div>
        <div className="flex gap-1.5">
          {(['', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
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

      {/* Table */}
      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-wine" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay reservas</p>
          </div>
        ) : (
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
                {filtered.map((b) => (
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
        )}
      </div>
    </div>
  )
}
