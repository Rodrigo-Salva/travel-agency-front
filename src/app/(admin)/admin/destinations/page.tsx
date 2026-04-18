'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Search, Pencil, Trash2, Loader2, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { queryKeys } from '@/lib/query/keys'
import type { Destination } from '@/features/destinations/types/destination.types'

const CONTINENTS = ['Africa', 'America', 'Asia', 'Europa', 'Oceania', 'Antartica'] as const

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  country: z.string().min(2, 'Requerido'),
  continent: z.enum(CONTINENTS),
  short_description: z.string().min(10, 'Mínimo 10 caracteres'),
  description: z.string().optional(),
  best_season: z.string().optional(),
  is_popular: z.boolean(),
})

type FormData = z.infer<typeof schema>

function DestinationModal({
  dest,
  onClose,
}: {
  dest: Destination | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = !!dest

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      name: dest.name,
      country: dest.country,
      continent: dest.continent,
      short_description: dest.short_description,
      description: dest.description ?? '',
      best_season: dest.best_season ?? '',
      is_popular: dest.is_popular,
    } : {
      continent: 'America',
      is_popular: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? destinationsApi.update(dest.id, data) : destinationsApi.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Destino actualizado' : 'Destino creado')
      qc.invalidateQueries({ queryKey: queryKeys.destinations.all })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Destinos</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${dest.name}` : 'Nuevo destino'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre *</Label>
                <Input {...register('name')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">País *</Label>
                <Input {...register('country')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Continente *</Label>
                <select {...register('continent')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Mejor época</Label>
                <Input {...register('best_season')} placeholder="Ej: Diciembre - Marzo" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción corta *</Label>
              <Input {...register('short_description')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              {errors.short_description && <p className="text-red-400 text-xs">{errors.short_description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción completa</Label>
              <textarea {...register('description')} rows={3}
                className="w-full bg-brand-darkest border border-brand-steel/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-wine resize-none" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_popular')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Marcar como popular</span>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear destino'}
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

export default function AdminDestinationsPage() {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalDest, setModalDest] = useState<Destination | null | 'new'>(undefined as unknown as null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 100 }),
    queryFn: () => destinationsApi.list({ page_size: 100 }),
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => destinationsApi.delete(id),
    onSuccess: () => {
      toast.success('Destino eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.destinations.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const openNew = () => { setModalDest(null); setModalOpen(true) }
  const openEdit = (d: Destination) => { setModalDest(d); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const destinations = data?.destinations ?? []
  const filtered = destinations.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {modalOpen && (
        <DestinationModal
          dest={modalDest as Destination | null}
          onClose={closeModal}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Destinos</h1>
          <p className="text-brand-silver text-sm mt-1">{destinations.length} destinos registrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo destino
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar destino o país..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay destinos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Destino', 'País', 'Continente', 'Popular', 'Mejor época', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((dest) => (
                  <tr key={dest.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-brand-wine shrink-0" />
                        <span className="font-medium text-white">{dest.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver">{dest.country}</td>
                    <td className="px-4 py-3 text-brand-silver">{dest.continent}</td>
                    <td className="px-4 py-3">
                      {dest.is_popular
                        ? <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        : <span className="text-brand-steel text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-silver text-xs">{dest.best_season || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(dest)}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === dest.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(dest.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(dest.id)}
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
        )}
      </div>
    </div>
  )
}
