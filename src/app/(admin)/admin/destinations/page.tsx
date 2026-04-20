'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Search, Pencil, Trash2, Loader2, Star, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { queryKeys } from '@/lib/query/keys'
import type { Destination } from '@/features/destinations/types/destination.types'

const PAGE_SIZE = 8
const CONTINENTS = ['Africa', 'America', 'Asia', 'Europa', 'Oceania', 'Antartica'] as const

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
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

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

function ImageUpload({
  current,
  file,
  onChange,
}: {
  current: string | null
  file: File | null
  onChange: (f: File | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : current ? `${BASE_URL}${current}` : null

  return (
    <div className="space-y-1.5">
      <Label className="text-brand-silver text-xs">Imagen</Label>
      <div
        onClick={() => ref.current?.click()}
        className="relative w-full h-36 rounded-xl border-2 border-dashed border-brand-steel/20 bg-brand-darkest flex items-center justify-center cursor-pointer hover:border-brand-wine/50 transition-colors overflow-hidden"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium">Cambiar imagen</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-steel">
            <ImageIcon className="h-8 w-8" />
            <p className="text-xs">Haz clic para subir imagen</p>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-brand-steel hover:text-red-400 transition-colors"
        >
          Quitar imagen
        </button>
      )}
    </div>
  )
}

function DestinationModal({ dest, onClose }: { dest: Destination | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!dest
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: dest.name,
          country: dest.country,
          continent: dest.continent,
          short_description: dest.short_description,
          description: dest.description ?? '',
          best_season: dest.best_season ?? '',
          is_popular: dest.is_popular,
        }
      : { continent: 'America', is_popular: false },
  })

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      isEdit ? destinationsApi.update(dest.id, formData) : destinationsApi.create(formData),
    onSuccess: () => {
      toast.success(isEdit ? 'Destino actualizado' : 'Destino creado')
      qc.invalidateQueries({ queryKey: queryKeys.destinations.all })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  const onSubmit = (values: FormData) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== '') fd.append(k, String(v))
    })
    if (imageFile) fd.append('image', imageFile)
    mutation.mutate(fd)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <ImageUpload
              current={dest?.image ?? null}
              file={imageFile}
              onChange={setImageFile}
            />

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
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalDest, setModalDest] = useState<Destination | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    queryFn: () => destinationsApi.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
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

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const destinations = data?.destinations ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <DestinationModal dest={modalDest} onClose={closeModal} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Destinos</h1>
          <p className="text-brand-silver text-sm mt-1">{total} destinos registrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo destino
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar destino o país..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay destinos</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Imagen', 'Destino', 'País', 'Continente', 'Popular', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      {dest.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${BASE_URL}${dest.image}`} alt={dest.name} className="h-10 w-14 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded-lg bg-brand-darkest border border-brand-steel/10 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-brand-steel/40" />
                        </div>
                      )}
                    </td>
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
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
