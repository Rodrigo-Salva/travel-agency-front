'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Hotel, Search, Star, Loader2, Trash2, MapPin, Plus, Pencil, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hotelsApi } from '@/features/hotels/api/hotels.api'
import { destinationsApi } from '@/features/destinations/api/destinations.api'
import { formatPrice } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'
import type { Hotel as HotelType } from '@/features/hotels/types/hotel.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
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

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  destination: z.coerce.number({ invalid_type_error: 'Requerido' }).min(1, 'Selecciona un destino'),
  address: z.string().min(3, 'Requerido'),
  star_rating: z.coerce.number().min(1).max(5),
  price_per_night: z.coerce.number({ invalid_type_error: 'Requerido' }).min(0),
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

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

function ImageUpload({ current, file, onChange }: { current: string | null; file: File | null; onChange: (f: File | null) => void }) {
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

function HotelModal({ hotel, onClose }: { hotel: HotelType | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!hotel
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { data: destData } = useQuery({
    queryKey: queryKeys.destinations.list({ page_size: 200 }),
    queryFn: () => destinationsApi.list({ page_size: 200 }),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          name: hotel.name,
          destination: hotel.destination.id,
          address: hotel.address,
          star_rating: hotel.star_rating,
          price_per_night: parseFloat(hotel.price_per_night),
          total_rooms: hotel.total_rooms,
          description: hotel.description ?? '',
          amenities: hotel.amenities ?? '',
          check_in_time: hotel.check_in_time ?? '',
          check_out_time: hotel.check_out_time ?? '',
          phone: hotel.phone ?? '',
          email: hotel.email ?? '',
          is_active: hotel.is_active,
        }
      : { star_rating: 3, is_active: true, total_rooms: 1 },
  })

  const mutation = useMutation({
    mutationFn: (fd: globalThis.FormData) =>
      isEdit ? hotelsApi.update(hotel.id, fd) : hotelsApi.create(fd),
    onSuccess: () => {
      toast.success(isEdit ? 'Hotel actualizado' : 'Hotel creado')
      qc.invalidateQueries({ queryKey: queryKeys.hotels.all })
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
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Hoteles</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${hotel.name}` : 'Nuevo hotel'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <ImageUpload current={hotel?.image ?? null} file={imageFile} onChange={setImageFile} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Nombre *</Label>
                <Input {...register('name')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Destino *</Label>
                <select {...register('destination')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  <option value="">Seleccionar...</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Estrellas *</Label>
                <select {...register('star_rating')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Dirección *</Label>
                <Input {...register('address')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio por noche (USD) *</Label>
                <Input type="number" step="0.01" {...register('price_per_night')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.price_per_night && <p className="text-red-400 text-xs">{errors.price_per_night.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Total habitaciones *</Label>
                <Input type="number" {...register('total_rooms')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.total_rooms && <p className="text-red-400 text-xs">{errors.total_rooms.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Check-in</Label>
                <Input type="time" {...register('check_in_time')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Check-out</Label>
                <Input type="time" {...register('check_out_time')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Teléfono</Label>
                <Input {...register('phone')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Email</Label>
                <Input type="email" {...register('email')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción</Label>
              <textarea {...register('description')} rows={3}
                className="w-full bg-brand-darkest border border-brand-steel/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-wine resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Amenidades (separadas por coma)</Label>
              <textarea {...register('amenities')} rows={2} placeholder="WiFi, Piscina, Gimnasio..."
                className="w-full bg-brand-darkest border border-brand-steel/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-wine resize-none" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Hotel activo</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear hotel'}
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

export default function AdminHotelsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalHotel, setModalHotel] = useState<HotelType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hotels.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    queryFn: () => hotelsApi.list({ page, page_size: PAGE_SIZE, search: search || undefined }),
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelsApi.delete(id),
    onSuccess: () => {
      toast.success('Hotel eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.hotels.all })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  const hotels = data?.hotels ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <HotelModal hotel={modalHotel} onClose={() => setModalOpen(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Hoteles</h1>
          <p className="text-brand-silver text-sm mt-1">{total} hoteles registrados</p>
        </div>
        <button onClick={() => { setModalHotel(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo hotel
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar hotel..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Hotel className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay hoteles</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Imagen', 'Hotel', 'Destino', 'Estrellas', 'Precio/noche', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      {hotel.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${BASE_URL}${hotel.image}`} alt={hotel.name} className="h-10 w-14 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-14 rounded-lg bg-brand-darkest border border-brand-steel/10 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-brand-steel/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{hotel.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-brand-silver">
                        <MapPin className="h-3 w-3 text-brand-wine" />
                        {hotel.destination.name}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StarRow n={hotel.star_rating} /></td>
                    <td className="px-4 py-3 font-semibold text-white">{formatPrice(hotel.price_per_night)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${hotel.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {hotel.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setModalHotel(hotel); setModalOpen(true) }}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === hotel.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(hotel.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(hotel.id)}
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
