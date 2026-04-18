'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Search, Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

interface Inquiry {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'responded' | 'closed'
  admin_response?: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:         { label: 'Nueva',       color: 'text-blue-400' },
  in_progress: { label: 'En progreso', color: 'text-amber-400' },
  responded:   { label: 'Respondida',  color: 'text-emerald-400' },
  closed:      { label: 'Cerrada',     color: 'text-brand-steel' },
}

const STATUS_OPTIONS = ['new', 'in_progress', 'responded', 'closed'] as const

export default function AdminInquiriesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: [...queryKeys.inquiries.all, 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.inquiries, { params: { page_size: 200 } })
      if ('results' in data) return data.results?.consultas ?? data.results ?? []
      return data.consultas ?? []
    },
    staleTime: 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, string> }) =>
      apiClient.patch(API.inquiry(id), payload),
    onSuccess: () => {
      toast.success('Consulta actualizada')
      qc.invalidateQueries({ queryKey: queryKeys.inquiries.all })
    },
    onError: () => toast.error('Error al actualizar'),
  })

  const filtered = inquiries.filter((q) => {
    if (statusFilter && q.status !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return q.name.toLowerCase().includes(s) || q.subject.toLowerCase().includes(s) || q.email.toLowerCase().includes(s)
    }
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Consultas</h1>
        <p className="text-brand-silver text-sm mt-1">{inquiries.length} consultas recibidas</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
          <Input placeholder="Buscar consulta..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-brand-wine text-white' : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white'}`}>
              {s === '' ? 'Todas' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-brand-dark border border-brand-steel/10">
            <MessageSquare className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay consultas</p>
          </div>
        ) : (
          filtered.map((q) => {
            const cfg = STATUS_CONFIG[q.status]
            const isOpen = expanded === q.id
            return (
              <div key={q.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-brand-steel/5 transition-colors">
                  <MessageSquare className="h-4 w-4 text-brand-wine mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{q.subject}</span>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-brand-silver text-xs">{q.name}</span>
                      <span className="flex items-center gap-1 text-brand-steel text-xs"><Mail className="h-3 w-3" />{q.email}</span>
                      {q.phone && <span className="flex items-center gap-1 text-brand-steel text-xs"><Phone className="h-3 w-3" />{q.phone}</span>}
                      <span className="text-brand-steel text-xs">{formatDate(q.created_at)}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-brand-steel/10 space-y-4 pt-4">
                    <div>
                      <p className="text-xs text-brand-steel uppercase font-semibold tracking-wider mb-1">Mensaje</p>
                      <p className="text-brand-silver text-sm whitespace-pre-wrap">{q.message}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-brand-steel">Cambiar estado:</span>
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s} disabled={q.status === s || updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: q.id, payload: { status: s } })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                            q.status === s ? 'bg-brand-wine/20 text-brand-wine' : 'border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40'
                          }`}>
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
