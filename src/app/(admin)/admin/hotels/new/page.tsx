'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, Hotel } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hotelsApi } from '@/features/hotels/api/hotels.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.coerce.number().min(1, 'Selecciona un destino'),
  address: z.string().min(3, 'Requerido'),
  star_rating: z.coerce.number().min(1).max(5),
  price_per_night: z.coerce.number().min(0),
  total_rooms: z.coerce.number().min(1),
  description: z.string().optional(),
  amenities: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  is_active: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function NewHotelPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const preview = imageFile ? URL.createObjectURL(imageFile) : null

  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { star_rating: 3, is_active: true, total_rooms: 50, check_in_time: '14:00', check_out_time: '12:00' },
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const fd = new globalThis.FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, String(v))
      })
      if (imageFile) fd.append('image', imageFile)
      return hotelsApi.create(fd)
    },
    onSuccess: () => {
      toast.success('Hotel creado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.hotels.all })
      router.push(ROUTES.admin.hotels)
    },
    onError: () => toast.error('Error al crear el hotel'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'
  const destinations = destData?.destinations ?? []

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.admin.hotels} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Hoteles</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Hotel className="h-5 w-5 text-brand-wine" /> Nuevo hotel
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre *</Label>
                <Input {...register('name')} className={fc} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Destino *</Label>
                <select {...register('destination')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  <option value="">Selecciona...</option>
                  {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Dirección *</Label>
                <Input {...register('address')} className={fc} />
                {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Estrellas (1-5)</Label>
                <Input type="number" min="1" max="5" {...register('star_rating')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio por noche (USD)</Label>
                <Input type="number" step="0.01" {...register('price_per_night')} className={fc} />
                {errors.price_per_night && <p className="text-red-400 text-xs">{errors.price_per_night.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Total habitaciones</Label>
                <Input type="number" {...register('total_rooms')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Teléfono</Label>
                <Input {...register('phone')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Email</Label>
                <Input type="email" {...register('email')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Check-in</Label>
                <Input {...register('check_in_time')} className={fc} placeholder="14:00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Check-out</Label>
                <Input {...register('check_out_time')} className={fc} placeholder="12:00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción</Label>
              <textarea {...register('description')} rows={4}
                className={`w-full rounded-xl px-3 py-2 text-sm border resize-none focus:outline-none ${fc}`} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Amenidades (separadas por comas)</Label>
              <Input {...register('amenities')} className={fc} placeholder="WiFi, Piscina, Gym, Spa..." />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Hotel activo (visible en el sitio)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.hotels} className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">Cancelar</Link>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Crear hotel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
