'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, ImageIcon, Package, Plus, Pencil, Trash2, CalendarDays, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { packagesApi, type ItineraryDay } from '@/features/packages/api/packages.api'
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
  capacity: z.coerce.number().min(1).optional(),
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

// ─── Itinerary editor ────────────────────────────────────────────────────────

interface DayFormState {
  day_number: number
  title: string
  description: string
  activitiesRaw: string   // comma-separated
  mealsRaw: string        // comma-separated
}

function ItineraryEditor({ packageId }: { packageId: string }) {
  const qc = useQueryClient()
  const qKey = ['itinerary', packageId]

  const { data: days = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => packagesApi.getItinerary(packageId),
  })

  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const emptyForm = (): DayFormState => ({
    day_number: (days.length ?? 0) + 1,
    title: '',
    description: '',
    activitiesRaw: '',
    mealsRaw: '',
  })
  const [form, setForm] = useState<DayFormState>(emptyForm)

  function openNew() {
    setForm({ ...emptyForm(), day_number: days.length + 1 })
    setEditing('new')
  }

  function openEdit(day: ItineraryDay) {
    setForm({
      day_number: day.day_number,
      title: day.title,
      description: day.description,
      activitiesRaw: day.activities.join(', '),
      mealsRaw: day.meals_included.join(', '),
    })
    setEditing(day.id)
  }

  function parseList(raw: string): string[] {
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        day_number: form.day_number,
        title: form.title,
        description: form.description,
        activities: parseList(form.activitiesRaw),
        meals_included: parseList(form.mealsRaw),
      }
      if (editing === 'new') {
        return packagesApi.createItineraryDay(packageId, payload)
      } else {
        return packagesApi.updateItineraryDay(packageId, editing as number, payload)
      }
    },
    onSuccess: () => {
      toast.success(editing === 'new' ? 'Día agregado' : 'Día actualizado')
      qc.invalidateQueries({ queryKey: qKey })
      setEditing(null)
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { errores?: Record<string, string[]> } } })?.response?.data?.errores
      toast.error(msg ? JSON.stringify(msg) : 'Error al guardar el día')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (dayId: number) => packagesApi.deleteItineraryDay(packageId, dayId),
    onSuccess: () => {
      toast.success('Día eliminado')
      qc.invalidateQueries({ queryKey: qKey })
    },
    onError: () => toast.error('Error al eliminar'),
  })

  const fc = 'w-full rounded-xl px-3 py-2 text-sm border bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine focus:outline-none'

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Itinerario ({days.length} días)
        </p>
        {editing === null && (
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-rose hover:text-white border border-brand-wine/30 px-3 py-1.5 rounded-lg hover:bg-brand-wine/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar día
          </button>
        )}
      </div>

      {isLoading && (
        <div className="h-10 rounded-xl bg-brand-darkest/60 animate-pulse" />
      )}

      {/* Day cards */}
      {!isLoading && days.length === 0 && editing === null && (
        <p className="text-brand-steel text-sm text-center py-4">Sin días en el itinerario. Agrega el primer día.</p>
      )}

      <div className="space-y-2">
        {days.sort((a, b) => a.day_number - b.day_number).map(day => (
          <div key={day.id}>
            {editing === day.id ? (
              /* Edit form inline */
              <DayForm
                form={form}
                setForm={setForm}
                onSave={() => saveMutation.mutate()}
                onCancel={() => setEditing(null)}
                isPending={saveMutation.isPending}
                fc={fc}
              />
            ) : (
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-brand-darkest/50 border border-brand-steel/10 group">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-brand-wine/15 border border-brand-wine/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-brand-rose">{day.day_number}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{day.title}</p>
                    <p className="text-brand-steel text-xs truncate">{day.description.slice(0, 80)}{day.description.length > 80 ? '…' : ''}</p>
                    {day.activities.length > 0 && (
                      <p className="text-brand-steel/60 text-[11px] mt-0.5">{day.activities.length} actividad{day.activities.length !== 1 ? 'es' : ''}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(day)}
                    className="p-1.5 rounded-lg text-brand-silver hover:text-white hover:bg-brand-steel/20 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(day.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg text-brand-silver hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New day form */}
      {editing === 'new' && (
        <DayForm
          form={form}
          setForm={setForm}
          onSave={() => saveMutation.mutate()}
          onCancel={() => setEditing(null)}
          isPending={saveMutation.isPending}
          fc={fc}
          isNew
        />
      )}
    </div>
  )
}

function DayForm({
  form, setForm, onSave, onCancel, isPending, fc, isNew = false,
}: {
  form: DayFormState
  setForm: (f: DayFormState) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
  fc: string
  isNew?: boolean
}) {
  return (
    <div className="rounded-xl border border-brand-wine/30 bg-brand-darkest/60 p-4 space-y-3">
      <p className="text-xs font-semibold text-brand-rose uppercase tracking-wider">
        {isNew ? 'Nuevo día' : `Editando día ${form.day_number}`}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-brand-silver text-xs">Número de día</label>
          <input type="number" min={1} className={fc} value={form.day_number}
            onChange={e => setForm({ ...form, day_number: Number(e.target.value) })} />
        </div>
        <div className="space-y-1">
          <label className="text-brand-silver text-xs">Título</label>
          <input type="text" className={fc} placeholder="Ej: Llegada a Cusco"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-brand-silver text-xs">Descripción</label>
        <textarea rows={3} className={`${fc} resize-none`} placeholder="Descripción del día..."
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="space-y-1">
        <label className="text-brand-silver text-xs">Actividades (separadas por coma)</label>
        <input type="text" className={fc} placeholder="Visita al Machu Picchu, Tour en tren, ..."
          value={form.activitiesRaw} onChange={e => setForm({ ...form, activitiesRaw: e.target.value })} />
      </div>
      <div className="space-y-1">
        <label className="text-brand-silver text-xs">Comidas incluidas (separadas por coma)</label>
        <input type="text" className={fc} placeholder="Desayuno, Almuerzo, ..."
          value={form.mealsRaw} onChange={e => setForm({ ...form, mealsRaw: e.target.value })} />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-steel/20 text-brand-silver text-xs hover:text-white transition-colors">
          <X className="h-3.5 w-3.5" /> Cancelar
        </button>
        <button type="button" onClick={onSave} disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-wine text-white text-xs font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Guardar día
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

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
      capacity: pkg.capacity ?? undefined,
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
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Cupos (vacío = ∞)</Label>
                <Input type="number" min={1} placeholder="Ilimitado" {...register('capacity')} className={fc} />
              </div>
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

        {/* Itinerario — fuera del form para no interferir con el submit */}
        <div className="mt-6">
          <ItineraryEditor packageId={id} />
        </div>
      </div>
    </div>
  )
}
