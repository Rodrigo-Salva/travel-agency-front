'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Plus, Search, Pencil, Trash2, Loader2, Star, Clock, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { packagesApi } from '@/features/packages/api/packages.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { PackageSummary } from '@/features/packages/types/package.types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.number().min(1, 'Selecciona un destino'),
  category: z.number().min(1, 'Selecciona una categoría'),
  short_description: z.string().min(10, 'Mínimo 10 caracteres'),
  description: z.string().optional(),
  duration_days: z.number().min(1),
  duration_nights: z.number().min(0),
  price_adult: z.number().min(1, 'Precio requerido'),
  price_child: z.number().min(0),
  min_people: z.number().min(1),
  max_people: z.number().min(1),
  includes_flight: z.boolean(),
  includes_hotel: z.boolean(),
  includes_meals: z.boolean(),
  includes_transport: z.boolean(),
  includes_guide: z.boolean(),
  is_featured: z.boolean(),
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

function PackageModal({
  pkg,
  onClose,
}: {
  pkg: PackageSummary | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = !!pkg

  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.packages.categories,
    queryFn: () => packagesApi.listCategories(),
  })

  const { data: pkgDetail } = useQuery({
    queryKey: queryKeys.packages.detail(pkg?.id ?? 0),
    queryFn: () => packagesApi.get(pkg!.id),
    enabled: isEdit,
  })

  const destinations = destData?.destinations ?? []

  const defaultValues: Partial<FormData> = isEdit && pkgDetail ? {
    name: pkgDetail.name,
    destination: typeof pkgDetail.destination === 'number' ? pkgDetail.destination : 0,
    category: pkgDetail.category.id,
    short_description: pkgDetail.short_description,
    description: pkgDetail.description ?? '',
    duration_days: pkgDetail.duration_days,
    duration_nights: pkgDetail.duration_nights,
    price_adult: parseFloat(pkgDetail.price_adult),
    price_child: parseFloat(pkgDetail.price_child),
    min_people: pkgDetail.min_people,
    max_people: pkgDetail.max_people,
    includes_flight: pkgDetail.includes_flight,
    includes_hotel: pkgDetail.includes_hotel,
    includes_meals: pkgDetail.includes_meals,
    includes_transport: pkgDetail.includes_transport,
    includes_guide: pkgDetail.includes_guide,
    is_featured: pkgDetail.is_featured,
    available_from: pkgDetail.available_from ?? '',
    available_until: pkgDetail.available_until ?? '',
  } : {
    duration_days: 7,
    duration_nights: 6,
    min_people: 1,
    max_people: 20,
    price_child: 0,
    includes_flight: false,
    includes_hotel: false,
    includes_meals: false,
    includes_transport: false,
    includes_guide: false,
    is_featured: false,
  }

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: (isEdit && pkgDetail) ? defaultValues as FormData : undefined,
    defaultValues: !isEdit ? defaultValues : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? packagesApi.update(pkg.id, data as Record<string, unknown>)
        : packagesApi.create(data as Record<string, unknown>),
    onSuccess: () => {
      toast.success(isEdit ? 'Paquete actualizado' : 'Paquete creado')
      qc.invalidateQueries({ queryKey: queryKeys.packages.all })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  const isLoadingDetail = isEdit && !pkgDetail

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Paquetes</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${pkg.name}` : 'Nuevo paquete'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-wine" />
          </div>
        ) : (
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="overflow-y-auto flex-1 flex flex-col">
            <div className="p-6 space-y-5 flex-1">
              {/* Básico */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-brand-steel uppercase tracking-wider border-b border-brand-steel/10 pb-2">Información básica</h3>
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-xs">Nombre *</Label>
                  <Input {...register('name')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Destino *</Label>
                    <select {...register('destination', { valueAsNumber: true })}
                      className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                      <option value="">Seleccionar...</option>
                      {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}, {d.country}</option>)}
                    </select>
                    {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Categoría *</Label>
                    <select {...register('category', { valueAsNumber: true })}
                      className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                      <option value="">Seleccionar...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
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
              </div>

              {/* Duración y precios */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-brand-steel uppercase tracking-wider border-b border-brand-steel/10 pb-2">Duración y precios</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    { label: 'Días', key: 'duration_days' },
                    { label: 'Noches', key: 'duration_nights' },
                    { label: 'Min pax', key: 'min_people' },
                    { label: 'Max pax', key: 'max_people' },
                  ] as const).map(({ label, key }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-brand-silver text-xs">{label}</Label>
                      <Input type="number" min={0} {...register(key, { valueAsNumber: true })}
                        className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Precio adulto (USD) *</Label>
                    <Input type="number" min={0} step="0.01" {...register('price_adult', { valueAsNumber: true })}
                      className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                    {errors.price_adult && <p className="text-red-400 text-xs">{errors.price_adult.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Precio niño (USD)</Label>
                    <Input type="number" min={0} step="0.01" {...register('price_child', { valueAsNumber: true })}
                      className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Disponible desde</Label>
                    <Input type="date" {...register('available_from')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-brand-silver text-xs">Disponible hasta</Label>
                    <Input type="date" {...register('available_until')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              {/* Incluye */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-brand-steel uppercase tracking-wider border-b border-brand-steel/10 pb-2">¿Qué incluye?</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {CHECKBOXES.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register(key)} className="w-4 h-4 accent-brand-wine" />
                      <span className="text-xs text-brand-silver">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
              <button type="submit" disabled={mutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Guardar cambios' : 'Crear paquete'}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white transition-colors text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AdminPackagesPage() {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingPkg, setEditingPkg] = useState<PackageSummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.packages.list({ page_size: 100 }),
    queryFn: () => packagesApi.list({ page_size: 100 }),
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => packagesApi.delete(id),
    onSuccess: () => {
      toast.success('Paquete eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.packages.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const openNew = () => { setEditingPkg(null); setModalOpen(true) }
  const openEdit = (p: PackageSummary) => { setEditingPkg(p); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const packages = data?.packages ?? []
  const filtered = packages.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.destination_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <PackageModal pkg={editingPkg} onClose={closeModal} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Paquetes</h1>
          <p className="text-brand-silver text-sm mt-1">{packages.length} paquetes registrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo paquete
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar paquete o destino..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay paquetes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Paquete', 'Destino', 'Categoría', 'Duración', 'Precio', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {pkg.is_featured && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                        <span className="font-medium text-white line-clamp-1">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-silver whitespace-nowrap">{pkg.destination_name}</td>
                    <td className="px-4 py-3 text-brand-silver whitespace-nowrap">{pkg.category_name}</td>
                    <td className="px-4 py-3 text-brand-silver whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration_days}d/{pkg.duration_nights}n</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{formatPrice(pkg.price_adult)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(pkg)}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === pkg.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(pkg.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(pkg.id)}
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
