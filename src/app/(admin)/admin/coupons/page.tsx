'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tag, Search, Loader2, CheckCircle2, XCircle, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { queryKeys } from '@/lib/query/keys'

interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  min_purchase_amount?: string
  max_discount_amount?: string
  valid_from: string
  valid_until: string
  max_uses?: number
  times_used: number
  is_active: boolean
}

function formatDiscount(coupon: Coupon) {
  const val = parseFloat(coupon.discount_value)
  return coupon.discount_type === 'percentage' ? `${val}%` : `$${val.toFixed(2)}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toDateValue(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

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
  code: z.string().min(3, 'Mínimo 3 caracteres').toUpperCase(),
  description: z.string().min(5, 'Mínimo 5 caracteres'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number({ invalid_type_error: 'Requerido' }).min(0),
  min_purchase_amount: z.coerce.number().min(0).optional(),
  max_discount_amount: z.coerce.number().min(0).optional(),
  valid_from: z.string().min(1, 'Requerido'),
  valid_until: z.string().min(1, 'Requerido'),
  max_uses: z.coerce.number().min(1).optional(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

function CouponModal({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!coupon

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: parseFloat(coupon.discount_value),
          min_purchase_amount: coupon.min_purchase_amount ? parseFloat(coupon.min_purchase_amount) : undefined,
          max_discount_amount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount) : undefined,
          valid_from: toDateValue(coupon.valid_from),
          valid_until: toDateValue(coupon.valid_until),
          max_uses: coupon.max_uses,
          is_active: coupon.is_active,
        }
      : { discount_type: 'percentage', is_active: true },
  })

  const discountType = watch('discount_type')

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      isEdit
        ? apiClient.patch(`${API.coupons}${coupon.id}/`, values)
        : apiClient.post(API.coupons, values),
    onSuccess: () => {
      toast.success(isEdit ? 'Cupón actualizado' : 'Cupón creado')
      qc.invalidateQueries({ queryKey: queryKeys.coupons })
      onClose()
    },
    onError: () => toast.error(isEdit ? 'Error al actualizar' : 'Error al crear'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-brand-dark border border-brand-steel/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10 shrink-0">
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Cupones</p>
            <h2 className="font-display text-xl font-bold text-white">
              {isEdit ? `Editar: ${coupon.code}` : 'Nuevo cupón'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Código *</Label>
                <Input {...register('code')} placeholder="VERANO2025" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine uppercase font-mono tracking-wider" />
                {errors.code && <p className="text-red-400 text-xs">{errors.code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Tipo de descuento *</Label>
                <select {...register('discount_type')} className="w-full bg-brand-darkest border border-brand-steel/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-wine">
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Descripción *</Label>
              <Input {...register('description')} placeholder="Descuento de verano para paquetes de playa" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">
                  Valor {discountType === 'percentage' ? '(%)' : '(USD)'} *
                </Label>
                <Input type="number" step="0.01" min="0" {...register('discount_value')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
                {errors.discount_value && <p className="text-red-400 text-xs">{errors.discount_value.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Compra mínima (USD)</Label>
                <Input type="number" step="0.01" min="0" {...register('min_purchase_amount')} placeholder="0" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Usos máximos</Label>
                <Input type="number" min="1" {...register('max_uses')} placeholder="Sin límite" className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Válido desde *</Label>
                <Input type="date" {...register('valid_from')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                {errors.valid_from && <p className="text-red-400 text-xs">{errors.valid_from.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Válido hasta *</Label>
                <Input type="date" {...register('valid_until')} className="bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine [color-scheme:dark]" />
                {errors.valid_until && <p className="text-red-400 text-xs">{errors.valid_until.message}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-brand-wine" />
              <span className="text-sm text-brand-silver">Cupón activo</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-brand-steel/10 flex gap-3 shrink-0">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-60 text-sm">
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear cupón'}
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

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<{ coupons: Coupon[]; count: number }>({
    queryKey: [...queryKeys.coupons, 'admin', page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      const { data } = await apiClient.get(API.coupons, { params })
      if ('results' in data) {
        return { count: data.count ?? 0, coupons: data.results?.cupones ?? data.results ?? [] }
      }
      const list = data.cupones ?? []
      return { count: list.length, coupons: list }
    },
    staleTime: 2 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API.coupons}${id}/`),
    onSuccess: () => {
      toast.success('Cupón eliminado')
      qc.invalidateQueries({ queryKey: queryKeys.coupons })
      setDeletingId(null)
    },
    onError: () => { toast.error('No se pudo eliminar'); setDeletingId(null) },
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const coupons = data?.coupons ?? []
  const total = data?.count ?? 0

  return (
    <div className="p-6 space-y-6">
      {modalOpen && <CouponModal coupon={modalCoupon} onClose={() => setModalOpen(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
          <h1 className="font-display text-3xl font-bold text-white">Cupones</h1>
          <p className="text-brand-silver text-sm mt-1">{total} cupones registrados</p>
        </div>
        <button onClick={() => { setModalCoupon(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          <Plus className="h-4 w-4" />
          Nuevo cupón
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar cupón..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay cupones</p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Código', 'Descripción', 'Descuento', 'Validez', 'Usos', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-steel/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-brand-wine tracking-wider text-xs bg-brand-wine/10 px-2 py-1 rounded">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-silver max-w-xs">
                      <p className="line-clamp-1">{c.description}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatDiscount(c)}</td>
                    <td className="px-4 py-3 text-brand-silver text-xs whitespace-nowrap">
                      {formatDate(c.valid_from)} &ndash; {formatDate(c.valid_until)}
                    </td>
                    <td className="px-4 py-3 text-brand-silver">
                      {c.times_used}{c.max_uses ? `/${c.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${c.is_active ? 'text-emerald-400' : 'text-brand-steel'}`}>
                        {c.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {c.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setModalCoupon(c); setModalOpen(true) }}
                          className="p-1.5 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {deletingId === c.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deleteMutation.mutate(c.id)} disabled={deleteMutation.isPending}
                              className="text-xs text-red-400 hover:text-red-300 font-medium">
                              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                            </button>
                            <button onClick={() => setDeletingId(null)} className="text-xs text-brand-steel hover:text-white">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(c.id)}
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
