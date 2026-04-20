'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plane, Search, Loader2, ArrowRight, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

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
  flight_class: string
  price: string
  available_seats: number
  baggage_allowance?: string
}

function formatDateTime(dt: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function toLocalDatetimeValue(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

const PAGE_SIZE = 8
const FLIGHT_CLASSES = ['Economy', 'Business', 'First'] as const

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

const schema = z.object({
  airline_name: z.string().min(2, 'Requerido'),
  airline_code: z.string().min(2, 'Requerido').max(4),
  flight_number: z.string().min(2, 'Requerido'),
  origin_city: z.string().min(2, 'Requerido'),
  destination_city: z.string().min(2, 'Requerido'),
  origin_airport: z.string().min(2, 'Requerido'),
  destination_airport: z.string().min(2, 'Requerido'),
  departure_time: z.string().min(1, 'Requerido'),
  arrival_time: z.string().min(1, 'Requerido'),
  flight_class: z.enum(FLIGHT_CLASSES),
  price: z.coerce.number({ invalid_type_error: 'Requerido' }).min(0),
  available_seats: z.coerce.number().min(1),
  baggage_allowance: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function FlightModal({ flight, onClose }: { flight: Flight | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!flight

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          airline_name: flight.airline_name,
          airline_code: flight.airline_code,
          flight_number: flight.flight_number,
          origin_city: flight.origin_city,
          destination_city: flight.destination_city,
          origin_airport: flight.origin_airport,
          destination_airport: flight.destination_airport,
          departure_time: toLocalDatetimeValue(flight.departure_time),
          arrival_time: toLocalDatetimeValue(flight.arrival_time),
          flight_class: (flight.flight_class as typeof FLIGHT_CLASSES[number]) ?? 'Economy',
          price: parseFloat(flight.price),
          available_seats: flight.available_seats,
          baggage_allowance: flight.baggage_allowance ?? '',
        }
      : { flight_class: 'Economy', available_seats: 100 },
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      isEdit
        ? apiClient.patch(API.flight(flight.id), values)
        : apiClient.post(API.flights, values),
    onSuccess: () => {
      toast.success(isEdit ? 'Vuelo actualizado' : 'Vuelo creado')
      qc.invalidateQueries({ queryKey: queryKeys.flights.all })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Vuelos</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${flight.airline_name} ${flight.flight_number}` : 'Nuevo vuelo'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {/* Aerolinea */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Aerolínea *</Label>
                <Input {...register('airline_name')} placeholder="LATAM Airlines" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.airline_name && <p className="text-red-400 text-xs">{errors.airline_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Código *</Label>
                <Input {...register('airline_code')} placeholder="LA" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine uppercase" />
                {errors.airline_code && <p className="text-red-400 text-xs">{errors.airline_code.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nro. vuelo *</Label>
                <Input {...register('flight_number')} placeholder="LA2047" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.flight_number && <p className="text-red-400 text-xs">{errors.flight_number.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Clase *</Label>
                <select {...register('flight_class')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  {FLIGHT_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Asientos disponibles *</Label>
                <Input type="number" {...register('available_seats')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
            </div>

            {/* Ruta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Ciudad origen *</Label>
                <Input {...register('origin_city')} placeholder="Lima" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.origin_city && <p className="text-red-400 text-xs">{errors.origin_city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Ciudad destino *</Label>
                <Input {...register('destination_city')} placeholder="Cusco" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.destination_city && <p className="text-red-400 text-xs">{errors.destination_city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Aeropuerto origen *</Label>
                <Input {...register('origin_airport')} placeholder="Jorge Chávez (LIM)" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.origin_airport && <p className="text-red-400 text-xs">{errors.origin_airport.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Aeropuerto destino *</Label>
                <Input {...register('destination_airport')} placeholder="Alejandro Velasco Astete (CUZ)" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.destination_airport && <p className="text-red-400 text-xs">{errors.destination_airport.message}</p>}
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Salida *</Label>
                <Input type="datetime-local" {...register('departure_time')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                {errors.departure_time && <p className="text-red-400 text-xs">{errors.departure_time.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Llegada *</Label>
                <Input type="datetime-local" {...register('arrival_time')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                {errors.arrival_time && <p className="text-red-400 text-xs">{errors.arrival_time.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio (USD) *</Label>
                <Input type="number" step="0.01" {...register('price')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Equipaje permitido</Label>
                <Input {...register('baggage_allowance')} placeholder="23kg" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear vuelo'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white transition-colors text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminFlightsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalFlight, setModalFlight] = useState<Flight | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ flights: Flight[]; count: number }>({
    queryKey: [...queryKeys.flights.all, 'admin', page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      const { data } = await apiClient.get(API.flights, { params })
      if ('results' in data) {
        return { count: data.count ?? 0, flights: data.results?.vuelos ?? data.results ?? [] }
      }
      const list = data.vuelos ?? []
      return { count: list.length, flights: list }
    },
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.flight(id)),
    onSuccess: () => {
      toast.success('Vuelo eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.flights.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const flights = data?.flights ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <FlightModal flight={modalFlight} onClose={() => setModalOpen(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Vuelos</h1>
          <p className="text-brand-silver text-sm mt-1">{total} vuelos registrados</p>
        </div>
        <button onClick={() => { setModalFlight(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo vuelo
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar vuelo..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Plane className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay vuelos</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Vuelo', 'Ruta', 'Salida', 'Llegada', 'Clase', 'Asientos', 'Precio', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{f.airline_name}</p>
                      <p className="text-xs text-brand-steel">{f.airline_code} {f.flight_number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-brand-silver text-xs">
                        <span>{f.origin_city}</span>
                        <ArrowRight className="h-3 w-3 text-brand-wine shrink-0" />
                        <span>{f.destination_city}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver text-xs whitespace-nowrap">{formatDateTime(f.departure_time)}</td>
                    <td className="px-4 py-3 text-brand-silver text-xs whitespace-nowrap">{formatDateTime(f.arrival_time)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-darkest border border-brand-steel/20 text-brand-silver">
                        {f.flight_class}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-silver">{f.available_seats}</td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPrice(f.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setModalFlight(f); setModalOpen(true) }}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === f.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(f.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(f.id)}
                            className="p-1.5 rounded-lg text-brand-steel hover:text-red-400 hover:bg-red-500/5 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
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
