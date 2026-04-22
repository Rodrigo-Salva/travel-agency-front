'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Search, Loader2, Clock, Users, Plus, Pencil, Trash2, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { activitiesApi } from '@/features/activities/api/activities.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { formatPrice, resolveImage } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { Activity, ActivityType, DifficultyLevel } from '@/features/activities/types/activity.types'

const PAGE_SIZE = 8

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

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  sightseeing: 'Turismo', adventure: 'Aventura', cultural: 'Cultural',
  shopping: 'Compras', dining: 'Comida', sports: 'Deportes',
  wellness: 'Bienestar', entertainment: 'Entretenimiento',
}
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'text-emerald-400', moderate: 'text-amber-400', difficult: 'text-red-400',
}
const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Fácil', moderate: 'Moderado', difficult: 'Difícil',
}

const ACTIVITY_TYPES: ActivityType[] = ['sightseeing', 'adventure', 'cultural', 'shopping', 'dining', 'sports', 'wellness', 'entertainment']
const DIFFICULTY_LEVELS: DifficultyLevel[] = ['easy', 'moderate', 'difficult']

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.coerce.number({ invalid_type_error: 'Requerido' }).min(1, 'Selecciona un destino'),
  activity_type: z.enum(['sightseeing', 'adventure', 'cultural', 'shopping', 'dining', 'sports', 'wellness', 'entertainment'] as const),
  difficulty_level: z.enum(['easy', 'moderate', 'difficult'] as const),
  description: z.string().min(5, 'Mínimo 5 caracteres'),
  duration_hours: z.coerce.number({ invalid_type_error: 'Requerido' }).min(0.5),
  price_per_person: z.coerce.number({ invalid_type_error: 'Requerido' }).min(0),
  max_group_size: z.coerce.number().min(1),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

function ImageUpload({ current, file, onChange }: { current: string | null; file: File | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : resolveImage(current)

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
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </div>
      {file && (
        <button type="button" onClick={() => onChange(null)} className="text-xs text-brand-steel hover:text-red-400 transition-colors">
          Quitar imagen
        </button>
      )}
    </div>
  )
}

function ActivityModal({ activity, onClose }: { activity: Activity | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!activity
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: activity.name,
          destination: activity.destination,
          activity_type: activity.activity_type,
          difficulty_level: activity.difficulty_level,
          description: activity.description,
          duration_hours: parseFloat(activity.duration_hours),
          price_per_person: parseFloat(activity.price_per_person),
          max_group_size: activity.max_group_size,
          is_active: activity.is_active,
        }
      : { activity_type: 'sightseeing', difficulty_level: 'easy', is_active: true, max_group_size: 10 },
  })

  const mutation = useMutation({
    mutationFn: (fd: globalThis.FormData) =>
      isEdit ? activitiesApi.update(activity.id, fd) : activitiesApi.create(fd),
    onSuccess: () => {
      toast.success(isEdit ? 'Actividad actualizada' : 'Actividad creada')
      qc.invalidateQueries({ queryKey: queryKeys.activities.all })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  const onSubmit = (values: FormData) => {
    const fd = new globalThis.FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== '') fd.append(k, String(v))
    })
    if (imageFile) fd.append('image', imageFile)
    mutation.mutate(fd)
  }

  const destinations = destData?.destinations ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Actividades</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${activity.name}` : 'Nueva actividad'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <ImageUpload current={activity?.image ?? null} file={imageFile} onChange={setImageFile} />

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Nombre *</Label>
              <Input {...register('name')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Destino *</Label>
                <select {...register('destination')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  <option value="">Seleccionar...</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Tipo *</Label>
                <select {...register('activity_type')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Dificultad *</Label>
                <select {...register('difficulty_level')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  {DIFFICULTY_LEVELS.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Duración (horas) *</Label>
                <Input type="number" step="0.5" {...register('duration_hours')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.duration_hours && <p className="text-red-400 text-xs">{errors.duration_hours.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio por persona (USD) *</Label>
                <Input type="number" step="0.01" {...register('price_per_person')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.price_per_person && <p className="text-red-400 text-xs">{errors.price_per_person.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Máx. grupo</Label>
                <Input type="number" {...register('max_group_size')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción *</Label>
              <textarea {...register('description')} rows={3}
                className="w-full bg-brand-darkest border border-brand-steel/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-wine resize-none" />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Actividad activa</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear actividad'}
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

export default function AdminActivitiesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalActivity, setModalActivity] = useState<Activity | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.activities.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    queryFn: () => activitiesApi.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => activitiesApi.delete(id),
    onSuccess: () => {
      toast.success('Actividad eliminada')
      qc.invalidateQueries({ queryKey: queryKeys.activities.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const activities = data?.activities ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <ActivityModal activity={modalActivity} onClose={() => setModalOpen(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Actividades</h1>
          <p className="text-brand-silver text-sm mt-1">{total} actividades registradas</p>
        </div>
        <button onClick={() => { setModalActivity(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nueva actividad
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar actividad..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Zap className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay actividades</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Imagen', 'Actividad', 'Tipo', 'Dificultad', 'Duración', 'Precio', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      {act.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolveImage(act.image)!} alt={act.name} className="h-10 w-14 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded-lg bg-brand-darkest border border-brand-steel/10 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-brand-steel/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{act.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-darkest border border-brand-steel/20 text-brand-silver">
                        {ACTIVITY_LABELS[act.activity_type] ?? act.activity_type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${DIFFICULTY_COLORS[act.difficulty_level]}`}>
                      {DIFFICULTY_LABELS[act.difficulty_level]}
                    </td>
                    <td className="px-4 py-3 text-brand-silver">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{act.duration_hours}h</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPrice(act.price_per_person)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${act.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {act.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setModalActivity(act); setModalOpen(true) }}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === act.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(act.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(act.id)}
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
