'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { packagesApi } from '@/features/packages/api/packages.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.coerce.number().min(1, 'Selecciona un destino'),
  category: z.coerce.number().min(1, 'Selecciona una categoría'),
  short_description: z.string().min(10, 'Mínimo 10 caracteres'),
  description: z.string().optional(),
  duration_days: z.coerce.number().min(1),
  duration_nights: z.coerce.number().min(0),
  price_adult: z.coerce.number().min(1, 'Precio requerido'),
  price_child: z.coerce.number().min(0),
  min_people: z.coerce.number().min(1),
  max_people: z.coerce.number().min(1),
  includes_flight: z.boolean(),
  includes_hotel: z.boolean(),
  includes_meals: z.boolean(),
  includes_transport: z.boolean(),
  includes_guide: z.boolean(),
  is_featured: z.boolean(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const CHECKBOXES = [
  { key: 'includes_flight',    label: 'Vuelo' },
  { key: 'includes_hotel',     label: 'Hotel' },
  { key: 'includes_meals',     label: 'Comidas' },
  { key: 'includes_transport', label: 'Transporte' },
  { key: 'includes_guide',     label: 'Guía' },
  { key: 'is_featured',        label: 'Destacado' },
] as const

export default function NewPackagePage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const preview = imageFile ? URL.createObjectURL(imageFile) : null

  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => packagesApi.listCategories(),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      includes_flight: true, includes_hotel: true, includes_meals: false,
      includes_transport: true, includes_guide: false, is_featured: false,
      duration_days: 7, duration_nights: 6, min_people: 1, max_people: 20,
      price_child: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const fd = new globalThis.FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      if (imageFile) fd.append('image', imageFile)
      return packagesApi.create(fd)
    },
    onSuccess: () => {
      toast.success('Paquete creado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.packages.all })
      router.push(ROUTES.admin.packages)
    },
    onError: () => toast.error('Error al crear el paquete'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'
  const destinations = destData?.destinations ?? []

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.admin.packages} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Paquetes</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-wine" /> Nuevo paquete
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit((v: FormData) => mutation.mutate(v))} className="space-y-6">

          {/* Image */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
            <Label className="text-brand-silver text-xs uppercase tracking-wider">Imagen principal</Label>
            <div onClick={() => imgRef.current?.click()}
              className="relative w-full h-48 rounded-xl border-2 border-dashed border-brand-steel/20 bg-brand-darkest flex items-center justify-center cursor-pointer hover:border-brand-wine/50 transition-colors overflow-hidden">
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-brand-steel"><ImageIcon className="h-10 w-10" /><p className="text-sm">Haz clic para subir imagen</p></div>
              }
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
            {imageFile && <button type="button" onClick={() => setImageFile(null)} className="text-xs text-brand-steel hover:text-red-400 transition-colors">Quitar imagen</button>}
          </div>

          {/* Info básica */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Información básica</p>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Nombre *</Label>
              <Input {...register('name')} className={fc} placeholder="ej. Aventura en Cusco 7 días" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Destino *</Label>
                <select {...register('destination')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  <option value="">Selecciona...</option>
                  {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Categoría *</Label>
                <select {...register('category')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  <option value="">Selecciona...</option>
                  {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
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
          </div>

          {/* Duración y precios */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Duración y precios</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Días</Label>
                <Input type="number" {...register('duration_days')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Noches</Label>
                <Input type="number" {...register('duration_nights')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio adulto (USD) *</Label>
                <Input type="number" step="0.01" {...register('price_adult')} className={fc} />
                {errors.price_adult && <p className="text-red-400 text-xs">{errors.price_adult.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio niño (USD)</Label>
                <Input type="number" step="0.01" {...register('price_child')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Mín. personas</Label>
                <Input type="number" {...register('min_people')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Máx. personas</Label>
                <Input type="number" {...register('max_people')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Descuento %</Label>
                <Input type="number" {...register('discount_percentage')} className={fc} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Disponible desde</Label>
                <Input type="date" {...register('available_from')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Disponible hasta</Label>
                <Input type="date" {...register('available_until')} className={fc} />
              </div>
            </div>
          </div>

          {/* Incluye */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">¿Qué incluye?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHECKBOXES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(key)} className="w-4 h-4 accent-brand-wine" />
                  <span className="text-sm text-brand-silver">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.packages}
              className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">
              Cancelar
            </Link>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Crear paquete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
