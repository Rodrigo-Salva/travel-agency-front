'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plane, Search, Loader2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
  const d = new Date(dt)
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminFlightsPage() {
  const [search, setSearch] = useState('')

  const { data: flights = [], isLoading } = useQuery<Flight[]>({
    queryKey: [...queryKeys.flights.all, 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.flights, { params: { page_size: 100 } })
      if ('results' in data) return data.results?.vuelos ?? data.results ?? []
      return data.vuelos ?? []
    },
    staleTime: 2 * 60 * 1000,
  })

  const filtered = flights.filter((f) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      f.airline_name.toLowerCase().includes(s) ||
      f.flight_number.toLowerCase().includes(s) ||
      f.origin_city.toLowerCase().includes(s) ||
      f.destination_city.toLowerCase().includes(s)
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Vuelos</h1>
        <p className="text-brand-silver text-sm mt-1">{flights.length} vuelos registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar vuelo..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Plane className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay vuelos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Vuelo', 'Ruta', 'Salida', 'Llegada', 'Clase', 'Asientos', 'Precio'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((f) => (
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
