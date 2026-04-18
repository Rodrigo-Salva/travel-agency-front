'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Hotel, Search, Star, Loader2, Trash2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { hotelsApi } from '@/features/hotels/api/hotels.api'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

export default function AdminHotelsPage() {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hotels.list({ page_size: 100 }),
    queryFn: () => hotelsApi.list({ page_size: 100 }),
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { apiClient } = await import('@/lib/api/client')
      const { API } = await import('@/lib/api/endpoints')
      await apiClient.delete(API.hotel(id))
    },
    onSuccess: () => {
      toast.success('Hotel eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.hotels.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const hotels = data?.hotels ?? []
  const filtered = hotels.filter((h) =>
    !search || h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.destination.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Hoteles</h1>
        <p className="text-brand-silver text-sm mt-1">{hotels.length} hoteles registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar hotel..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Hotel className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay hoteles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Hotel', 'Destino', 'Estrellas', 'Precio/noche', 'Habitaciones', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{hotel.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-brand-silver">
                        <MapPin className="h-3 w-3 text-brand-wine" />
                        {hotel.destination.name}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StarRow n={hotel.star_rating} /></td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPrice(hotel.price_per_night)}</td>
                    <td className="px-4 py-3 text-brand-silver">{hotel.total_rooms}</td>
                    <td className="px-4 py-3">
                      {deletingId === hotel.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => deleteMutation.mutate(hotel.id)} disabled={deleteMutation.isPending}
                            className="text-xs text-red-400 hover:text-red-300 font-medium">
                            {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                          </button>
                          <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(hotel.id)}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-red-400 hover:bg-red-500/5 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
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
