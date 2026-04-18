'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('')

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: [...queryKeys.coupons, 'admin'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.coupons, { params: { page_size: 200 } })
      if ('results' in data) return data.results?.cupones ?? data.results ?? []
      return data.cupones ?? []
    },
    staleTime: 2 * 60 * 1000,
  })

  const filtered = coupons.filter((c) =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest mb-1">Administración</p>
        <h1 className="font-display text-3xl font-bold text-white">Cupones</h1>
        <p className="text-brand-silver text-sm mt-1">{coupons.length} cupones registrados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
        <Input placeholder="Buscar cupón..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-brand-dark border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine" />
      </div>

      <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-brand-wine" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Tag className="h-10 w-10 text-brand-steel/40 mb-3" />
            <p className="text-brand-silver">No hay cupones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-steel/10">
                  {['Código', 'Descripción', 'Descuento', 'Validez', 'Usos', 'Estado'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-steel/10">
                {filtered.map((c) => (
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
                      {formatDate(c.valid_from)} – {formatDate(c.valid_until)}
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
