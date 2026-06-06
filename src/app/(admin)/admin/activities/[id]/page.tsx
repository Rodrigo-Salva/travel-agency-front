'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { activitiesApi } from '@/features/activities/api/activities.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { resolveImage } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'
import type { ActivityType, DifficultyLevel } from '@/features/activities/types/activity.types'

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'sightseeing', label: 'Turismo' }, { value: 'adventure', label: 'Aventura' },
  { value: 'cultural', label: 'Cultural' }, { value: 'shopping', label: 'Compras' },
  { value: 'dining', label: 'Comida' }, { value: 'sports', label: 'Deportes' },
  { value: 'wellness', label: 'Bienestar' }, { value: 'entertainment', label: 'Entretenimiento' },
]
const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Fácil' }, { value: 'moderate', label: 'Moderado' }, { value: 'difficult', label: 'Difícil' },
]

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.coerce.number().min(1, 'Selecciona un destino'),
  activity_type: z.enum(['sightseeing', 'adventure', 'cultural', 'shopping', 'dining', 'sports', 'wellness', 'entertainment'] as const),
  difficulty_level: z.enum(['easy', 'moderate', 'difficult'] as const),
  description: z.string().min(5, 'Mínimo 5 caracteres'),
  duration_hours: z.coerce.number().min(0.5),
  price_per_person: z.coerce.number().min(0),
  max_group_size: z.coerce.number().min(1),
  is_active: z.boolean(),
})
type FormData = z.infer<typeof schema>

interface Props { params: Promise<{ id: string }> }

export default function EditActivityPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const { data: activity, isLoading } = useQuery({
    queryKey: queryKeys.activities.detail(Number(id)),
    queryFn: () => activitiesApi.get(Number(id)),
  })
  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })

  const preview = imageFile ? URL.createObjectURL(imageFile) : resolveImage(activity?.image ?? null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    values: activity ? {
      name: activity.name,
      destination: activity.destination,
      activity_type: activity.activity_type,
      difficulty_level: activity.difficulty_level,
      description: activity.description,
      duration_hours: parseFloat(activity.duration_hours),
      price_per_person: parseFloat(activity.price_per_person),
      max_group_size: activity.max_group_size,
      is_active: activity.is_active,
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const fd = new globalThis.FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      if (imageFile) fd.append('image', imageFile)
      return activitiesApi.update(activity!.id, fd)
    },
    onSuccess: () => {
      toast.success('Actividad actualizada correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.activities.all })
      router.push(ROUTES.admin.activities)
    },
    onError: () => toast.error('Error al actualizar la actividad'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'

  if (isLoading) return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.admin.activities} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Actividades</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-wine" /> Editar: {activity?.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit((v: FormData) => mutation.mutate(v))} className="space-y-6">
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
            <Label className="text-brand-silver text-xs uppercase tracking-wider">Imagen</Label>
            <div onClick={() => imgRef.current?.click()}
              className="relative w-full h-40 rounded-xl border-2 border-dashed border-brand-steel/20 bg-brand-darkest flex items-center justify-center cursor-pointer hover:border-brand-wine/50 transition-colors overflow-hidden">
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-brand-steel"><ImageIcon className="h-8 w-8" /><p className="text-sm">Cambiar imagen</p></div>
              }
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Información</p>
            <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Nombre *</Label><Input {...register('name')} className={fc} />{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Destino *</Label>
                <select {...register('destination')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  <option value="">Selecciona...</option>
                  {(destData?.destinations ?? []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
              </div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Tipo</Label><select {...register('activity_type')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>{ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Dificultad</Label><select {...register('difficulty_level')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>{DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Duración (h)</Label><Input type="number" step="0.5" {...register('duration_hours')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Precio/persona</Label><Input type="number" step="0.01" {...register('price_per_person')} className={fc} />{errors.price_per_person && <p className="text-red-400 text-xs">{errors.price_per_person.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Max. grupo</Label><Input type="number" {...register('max_group_size')} className={fc} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Descripción *</Label><textarea {...register('description')} rows={4} className={`w-full rounded-xl px-3 py-2 text-sm border resize-none focus:outline-none ${fc}`} />{errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}</div>
            <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-brand-wine" /><span className="text-sm text-brand-silver">Actividad activa</span></label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.activities} className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">Cancelar</Link>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
