'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Search, Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

const PAGE_SIZE = 8

interface Review {
  id: number
  title: string
  comment: string
  overall_rating: number
  is_approved: boolean
  created_at: string
  customer_name?: string
}

function StarBadge({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Star className="h-3 w-3 fill-amber-400" />{n}
    </span>
  )
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

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [approvedFilter, setApprovedFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ reviews: Review[]; count: number }>({
    queryKey: [...queryKeys.reviews.all, 'admin', page, search, approvedFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (approvedFilter === 'approved') params.is_approved = 'true'
      if (approvedFilter === 'pending') params.is_approved = 'false'
      const { data } = await apiClient.get(API.reviews, { params })
      if ('results' in data) {
        return { count: data.count ?? 0, reviews: data.results?.resenas ?? data.results ?? [] }
      }
      const list = data.resenas ?? []
      return { count: list.length, reviews: list }
    },
    staleTime: 2 * 60 * 1000,
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

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleFilter = (f: typeof approvedFilter) => { setApprovedFilter(f); setPage(1) }

  const reviews = data?.reviews ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Reseñas</h1>
        <p className="text-brand-silver text-sm mt-1">{total} reseñas</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input placeholder="Buscar por título o comentario..." value={search} onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button key={f} onClick={() => handleFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                approvedFilter === f
                  ? 'bg-brand-wine text-white'
                  : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'
              }`}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Aprobadas'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Star className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay reseñas</p>
          </div>
        ) : (
          <>
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
                {reviews.map((r) => (
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
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
