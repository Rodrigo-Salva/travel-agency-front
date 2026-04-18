'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { Review } from '@/features/reviews/types/review.types'

function StarBadge({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Star className="h-3 w-3 fill-amber-400" />{n}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: [...queryKeys.reviews.all, 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.reviews, { params: { page_size: 100 } })
      if ('results' in data) return data.results?.resenas ?? data.results ?? []
      return data.resenas ?? []
    },
    staleTime: 60 * 1000,
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(API.review(id), { is_approved: true }),
    onSuccess: () => { toast.success('Reseña aprobada'); qc.invalidateQueries({ queryKey: queryKeys.reviews.all }) },
    onError: () => toast.error('Error al aprobar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.review(id)),
    onSuccess: () => { toast.success('Reseña eliminada'); qc.invalidateQueries({ queryKey: queryKeys.reviews.all }) },
    onError: () => toast.error('Error al eliminar'),
  })

  const filtered = reviews.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Reseñas</h1>
        <p className="text-brand-silver text-sm mt-1">{reviews.length} reseñas</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar por título o cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Star className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay reseñas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Cliente', 'Título', 'Rating', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3 text-brand-silver">{r.customer_name || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium max-w-xs">
                      <p className="line-clamp-1">{r.title}</p>
                      <p className="text-xs text-brand-steel line-clamp-1">{r.comment}</p>
                    </td>
                    <td className="px-4 py-3"><StarBadge n={r.overall_rating} /></td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${r.is_approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {r.is_approved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {r.is_approved ? 'Aprobada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-steel text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!r.is_approved && (
                          <button onClick={() => approveMutation.mutate(r.id)} disabled={approveMutation.isPending}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                          </button>
                        )}
                        <button onClick={() => deleteMutation.mutate(r.id)} disabled={deleteMutation.isPending}
                          className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
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
