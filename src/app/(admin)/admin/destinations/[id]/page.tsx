'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { resolveImage } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'

const CONTINENTS = ['África', 'América del Norte', 'América del Sur', 'Asia', 'Europa', 'Oceanía', 'Antártida'] as const

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  country: z.string().min(2, 'Requerido'),
  continent: z.enum(CONTINENTS),
  short_description: z.string().min(10, 'Mínimo 10 caracteres'),
  description: z.string().optional(),
  best_season: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  is_popular: z.boolean(),
})
type FormData = z.infer<typeof schema>

interface Props { params: Promise<{ id: string }> }

export default function EditDestinationPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const { data: destination, isLoading } = useQuery({
    queryKey: queryKeys.destinations.detail(id),
    queryFn: () => destinationsApi.get(id),
  })

  const preview = imageFile ? URL.createObjectURL(imageFile) : resolveImage(destination?.image ?? null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: destination ? {
      name: destination.name,
      country: destination.country,
      continent: (destination.continent as typeof CONTINENTS[number]) ?? 'América del Sur',
      short_description: destination.short_description ?? '',
      description: destination.description ?? '',
      best_season: destination.best_season ?? '',
      latitude: destination.latitude ? String(destination.latitude) : '',
      longitude: destination.longitude ? String(destination.longitude) : '',
      is_popular: destination.is_popular,
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const fd = new globalThis.FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      if (imageFile) fd.append('image', imageFile)
      return destinationsApi.update(Number(id), fd)
    },
    onSuccess: () => {
      toast.success('Destino actualizado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.destinations.all })
      router.push(ROUTES.admin.destinations)
    },
    onError: () => toast.error('Error al actualizar el destino'),
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
          <Link href={ROUTES.admin.destinations} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Destinos</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-wine" /> Editar: {destination?.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
          {/* Image */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
            <Label className="text-brand-silver text-xs uppercase tracking-wider">Imagen del destino</Label>
            <div
              onClick={() => imgRef.current?.click()}
              className="relative w-full h-48 rounded-xl border-2 border-dashed border-brand-steel/20 bg-brand-darkest flex items-center justify-center cursor-pointer hover:border-brand-wine/50 transition-colors overflow-hidden"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-brand-steel">
                  <ImageIcon className="h-10 w-10" />
                  <p className="text-sm">Haz clic para cambiar imagen</p>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            {imageFile && (
              <button type="button" onClick={() => setImageFile(null)} className="text-xs text-brand-steel hover:text-red-400 transition-colors">
                Quitar nueva imagen
              </button>
            )}
          </div>

          {/* Datos básicos */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Información básica</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre *</Label>
                <Input {...register('name')} className={fc} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">País *</Label>
                <Input {...register('country')} className={fc} />
                {errors.country && <p className="text-red-400 text-xs">{errors.country.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Continente *</Label>
                <select {...register('continent')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Mejor temporada</Label>
                <Input {...register('best_season')} className={fc} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción corta *</Label>
              <textarea {...register('short_description')} rows={2}
                className={`w-full rounded-xl px-3 py-2 text-sm border resize-none focus:outline-none ${fc}`} />
              {errors.short_description && <p className="text-red-400 text-xs">{errors.short_description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción completa</Label>
              <textarea {...register('description')} rows={5}
                className={`w-full rounded-xl px-3 py-2 text-sm border resize-none focus:outline-none ${fc}`} />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('is_popular')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Marcar como destino popular</span>
            </label>
          </div>

          {/* Coordenadas */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Ubicación</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Latitud</Label>
                <Input {...register('latitude')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Longitud</Label>
                <Input {...register('longitude')} className={fc} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.destinations}
              className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">
              Cancelar
            </Link>
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
