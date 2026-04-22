'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plane, Search, Clock, Users, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice } from '@/lib/utils/format'
import { Input } from '@/components/ui/input'

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
  duration_minutes: number
  price_economy: string
  price_business: string | null
  available_seats: number
  is_active: boolean
}

const PAGE_SIZE = 9

function FlightCard({ flight }: { flight: Flight }) {
  const dep = new Date(flight.departure_time)
  const arr = new Date(flight.arrival_time)
  const h = Math.floor(flight.duration_minutes / 60)
  const m = flight.duration_minutes % 60

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 hover:border-brand-wine/20 transition-all">
      {/* Airline */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-semibold">{flight.airline_name}</p>
          <p className="text-brand-steel text-xs font-mono">{flight.airline_code} {flight.flight_number}</p>
        </div>
        <span className="text-xs bg-brand-wine/10 border border-brand-wine/20 text-brand-rose px-2.5 py-1 rounded-full">
          {flight.available_seats} asientos
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center flex-1">
          <p className="font-display text-2xl font-bold text-white">{dep.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-brand-silver text-sm font-medium">{flight.origin_city}</p>
          <p className="text-brand-steel text-xs">{flight.origin_airport}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-xs text-brand-steel">
            <Clock className="h-3 w-3" />
            {h}h {m}m
          </div>
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 h-px bg-brand-steel/20" />
            <Plane className="h-3.5 w-3.5 text-brand-wine rotate-90" />
            <div className="flex-1 h-px bg-brand-steel/20" />
          </div>
          <p className="text-xs text-brand-steel">Directo</p>
        </div>
        <div className="text-center flex-1">
          <p className="font-display text-2xl font-bold text-white">{arr.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-brand-silver text-sm font-medium">{flight.destination_city}</p>
          <p className="text-brand-steel text-xs">{flight.destination_airport}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between pt-4 border-t border-brand-steel/10">
        <div>
          <p className="text-xs text-brand-steel">Desde</p>
          <p className="font-display text-xl font-bold text-white">{formatPrice(flight.price_economy)}</p>
          {flight.price_business && (
            <p className="text-xs text-brand-steel">Business: {formatPrice(flight.price_business)}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-brand-steel">
          <Users className="h-3.5 w-3.5" /> por persona
        </div>
      </div>
    </div>
  )
}

export default function FlightsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['flights-public', page, q],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE, is_active: 'true' }
      if (q) params.search = q
      const { data } = await apiClient.get(API.flights, { params })
      if ('results' in data) return { flights: data.results?.vuelos ?? data.results ?? [], count: data.count ?? 0 }
      return { flights: data.vuelos ?? [], count: 0 }
    },
    staleTime: 3 * 60 * 1000,
  })

  const flights = data?.flights ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function doSearch() { setQ(search); setPage(1) }

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">Vuelos disponibles</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Encuentra tu vuelo</h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto mb-8">
            Explora nuestras rutas disponibles y encuentra el vuelo perfecto para tu próxima aventura.
          </p>
          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Buscar por ciudad, aeropuerto o aerolínea..."
                className="pl-9 bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel"
              />
            </div>
            <button
              onClick={doSearch}
              className="px-5 py-2 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors text-sm"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-brand-dark animate-pulse" />)}
          </div>
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center gap-4">
            <Plane className="h-16 w-16 text-brand-steel/30" />
            <h2 className="text-2xl font-bold text-white">No se encontraron vuelos</h2>
            <p className="text-brand-silver">Intenta con otros términos de búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-brand-steel text-sm">{total} vuelo{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {flights.map((f: Flight) => <FlightCard key={f.id} flight={f} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="p-2 rounded-xl border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-wine/30 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-brand-silver text-sm">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  className="p-2 rounded-xl border border-brand-steel/20 text-brand-steel hover:text-white hover:border-brand-wine/30 disabled:opacity-30 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
