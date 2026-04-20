'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Search, Loader2, Mail, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

function InquiryDetail({ q, onClose }: { q: Inquiry; onClose: () => void }) {
  const qc = useQueryClient()
  const [response, setResponse] = useState(q.admin_response ?? '')

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      apiClient.patch(API.inquiry(q.id), payload),
    onSuccess: () => {
      toast.success('Consulta actualizada')
      qc.invalidateQueries({ queryKey: queryKeys.inquiries.all })
    },
    onError: () => toast.error('Error al actualizar'),
  })

  const sendResponse = () => {
    if (!response.trim()) return
    updateMutation.mutate({ admin_response: response, status: 'responded' })
  }

  const cfg = STATUS_CONFIG[q.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Consulta</p>
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white mt-0.5 line-clamp-1">{q.subject}</h2>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="text-brand-silver text-xs font-medium">{q.name}</span>
              <span className="flex items-center gap-1 text-brand-steel text-xs"><Mail className="h-3 w-3" />{q.email}</span>
              {q.phone && <span className="flex items-center gap-1 text-brand-steel text-xs"><Phone className="h-3 w-3" />{q.phone}</span>}
              <span className="text-brand-steel text-xs">{formatDate(q.created_at)}</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-4 p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors shrink-0">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Mensaje del cliente */}
          <div>
            <p className="text-xs text-brand-steel uppercase font-semibold tracking-wider mb-2">Mensaje del cliente</p>
            <div className="bg-brand-darkest rounded-xl px-4 py-3 border border-brand-steel/10">
              <p className="text-brand-silver text-sm whitespace-pre-wrap leading-relaxed">{q.message}</p>
            </div>
          </div>

          {/* Respuesta existente */}
          {q.admin_response && (
            <div>
              <p className="text-xs text-emerald-400 uppercase font-semibold tracking-wider mb-2">Respuesta enviada</p>
              <div className="bg-emerald-500/5 rounded-xl px-4 py-3 border border-emerald-500/20">
                <p className="text-brand-silver text-sm whitespace-pre-wrap leading-relaxed">{q.admin_response}</p>
              </div>
            </div>
          )}

          {/* Campo de respuesta */}
          <div className="space-y-2">
            <Label className="text-brand-silver text-xs">
              {q.admin_response ? 'Actualizar respuesta' : 'Escribir respuesta'}
            </Label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              placeholder="Escribe tu respuesta al cliente..."
              className="w-full bg-brand-darkest border border-brand-steel/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-wine resize-none placeholder:text-brand-steel/60"
            />
          </div>

          {/* Cambiar estado */}
          <div>
            <p className="text-xs text-brand-steel uppercase font-semibold tracking-wider mb-2">Estado</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button key={s}
                  disabled={q.status === s || updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ status: s })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                    q.status === s
                      ? 'bg-brand-wine/20 text-brand-wine border border-brand-wine/30'
                      : 'border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40'
                  }`}>
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
          <button
            onClick={sendResponse}
            disabled={!response.trim() || updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {q.admin_response ? 'Actualizar respuesta' : 'Enviar respuesta'}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white transition-colors text-sm font-medium">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminInquiriesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selected, setSelected] = useState<Inquiry | null>(null)
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
      toast.success('Estado actualizado')
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
      {selected && (
        <InquiryDetail
          q={selected}
          onClose={() => setSelected(null)}
        />
      )}

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
          {(['', ...STATUS_OPTIONS] as const).map((s) => (
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
            return (
              <button
                key={q.id}
                onClick={() => setSelected(q)}
                className="w-full text-left rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:bg-brand-steel/5 hover:border-brand-steel/20 transition-colors"
              >
                <div className="px-5 py-4 flex items-start gap-4">
                  <MessageSquare className="h-4 w-4 text-brand-wine mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{q.subject}</span>
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      {q.admin_response && (
                        <span className="text-xs text-brand-steel bg-brand-darkest px-2 py-0.5 rounded-full border border-brand-steel/20">Respondida</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-brand-silver text-xs">{q.name}</span>
                      <span className="flex items-center gap-1 text-brand-steel text-xs"><Mail className="h-3 w-3" />{q.email}</span>
                      {q.phone && <span className="flex items-center gap-1 text-brand-steel text-xs"><Phone className="h-3 w-3" />{q.phone}</span>}
                      <span className="text-brand-steel text-xs">{formatDate(q.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {STATUS_OPTIONS.filter(s => s !== q.status).slice(0, 1).map((s) => (
                      <button key={s}
                        onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: q.id, payload: { status: s } }) }}
                        disabled={updateMutation.isPending}
                        className="text-xs px-2 py-1 rounded-lg border border-brand-steel/20 text-brand-steel hover:text-white transition-colors hidden sm:block">
                        → {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
