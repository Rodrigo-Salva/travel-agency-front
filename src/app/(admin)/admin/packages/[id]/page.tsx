'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { packagesApi } from '@/features/packages/api/packages.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { resolveImage } from '@/lib/utils/format'
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
  { key: 'includes_flight', label: 'Vuelo' },
  { key: 'includes_hotel', label: 'Hotel' },
  { key: 'includes_meals', label: 'Comidas' },
  { key: 'includes_transport', label: 'Transporte' },
  { key: 'includes_guide', label: 'Guía' },
  { key: 'is_featured', label: 'Destacado' },
] as const

interface Props { params: Promise<{ id: string }> }

export default function EditPackagePage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const { data: pkg, isLoading } = useQuery({
    queryKey: queryKeys.packages.detail(id),
    queryFn: () => packagesApi.get(id),
  })
  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => packagesApi.listCategories(),
  })

  const preview = imageFile ? URL.createObjectURL(imageFile) : resolveImage(pkg?.image ?? null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    values: pkg ? {
      name: pkg.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      destination: (pkg as any).destination_id ?? pkg.destination,
      category: typeof pkg.category === 'object' ? pkg.category.id : pkg.category,
      short_description: pkg.short_description,
      description: pkg.description ?? '',
      duration_days: pkg.duration_days,
      duration_nights: pkg.duration_nights,
      price_adult: parseFloat(pkg.price_adult),
      price_child: parseFloat(pkg.price_child),
      min_people: pkg.min_people,
      max_people: pkg.max_people,
      includes_flight: pkg.includes_flight,
      includes_hotel: pkg.includes_hotel,
      includes_meals: pkg.includes_meals,
      includes_transport: pkg.includes_transport,
      includes_guide: pkg.includes_guide,
      is_featured: pkg.is_featured,
      discount_percentage: pkg.discount_percentage ? parseFloat(String(pkg.discount_percentage)) : undefined,
      available_from: pkg.available_from?.slice(0, 10) ?? '',
      available_until: pkg.available_until?.slice(0, 10) ?? '',
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const fd = new globalThis.FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      if (imageFile) fd.append('image', imageFile)
      return packagesApi.update(Number(id), fd)
    },
    onSuccess: () => {
      toast.success('Paquete actualizado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.packages.all })
      router.push(ROUTES.admin.packages)
    },
    onError: () => toast.error('Error al actualizar el paquete'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'
  const destinations = destData?.destinations ?? []

  if (isLoading) return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
    </div>
  )

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
              <Package className="h-5 w-5 text-brand-wine" /> Editar: {pkg?.name}
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
                : <div className="flex flex-col items-center gap-2 text-brand-steel"><ImageIcon className="h-10 w-10" /><p className="text-sm">Cambiar imagen</p></div>
              }
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          {/* Info básica */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Información básica</p>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Nombre *</Label>
              <Input {...register('name')} className={fc} />
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
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Días</Label><Input type="number" {...register('duration_days')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Noches</Label><Input type="number" {...register('duration_nights')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Precio adulto *</Label><Input type="number" step="0.01" {...register('price_adult')} className={fc} />{errors.price_adult && <p className="text-red-400 text-xs">{errors.price_adult.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Precio niño</Label><Input type="number" step="0.01" {...register('price_child')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Mín. personas</Label><Input type="number" {...register('min_people')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Máx. personas</Label><Input type="number" {...register('max_people')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Descuento %</Label><Input type="number" {...register('discount_percentage')} className={fc} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Disponible desde</Label><Input type="date" {...register('available_from')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Disponible hasta</Label><Input type="date" {...register('available_until')} className={fc} /></div>
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
            <Link href={ROUTES.admin.packages} className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">Cancelar</Link>
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
