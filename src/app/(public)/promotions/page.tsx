'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, CheckCircle2, XCircle, Percent, DollarSign, Copy, Check } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { toast } from 'sonner'

interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  valid_from: string
  valid_until: string
  is_active: boolean
  min_purchase_amount: string | null
  max_discount_amount: string | null
  max_uses: number | null
  current_uses: number
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    toast.success('Código copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpired = new Date(coupon.valid_until) < new Date()
  const isExhausted = coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses
  const active = coupon.is_active && !isExpired && !isExhausted

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${active ? 'bg-brand-dark border-brand-steel/10 hover:border-brand-wine/20' : 'bg-brand-darkest border-brand-steel/5 opacity-60'}`}>
      {/* Top stripe */}
      <div className={`h-1.5 ${active ? 'bg-gradient-to-r from-brand-wine to-brand-rose' : 'bg-brand-steel/20'}`} />

      <div className="p-5">
        {/* Code + status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-white text-xl tracking-widest">{coupon.code}</span>
              {active ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
            <p className="text-brand-silver text-sm">{coupon.description}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-brand-wine/10 border border-brand-wine/20' : 'bg-brand-steel/10'}`}>
            {coupon.discount_type === 'percentage'
              ? <Percent className={`h-6 w-6 ${active ? 'text-brand-rose' : 'text-brand-steel'}`} />
              : <DollarSign className={`h-6 w-6 ${active ? 'text-brand-rose' : 'text-brand-steel'}`} />
            }
          </div>
        </div>

        {/* Discount value */}
        <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 p-3 mb-4 text-center">
          <p className="font-display text-3xl font-bold text-white">
            {coupon.discount_type === 'percentage'
              ? `${coupon.discount_value}% OFF`
              : `${formatPrice(coupon.discount_value)} OFF`
            }
          </p>
          {coupon.min_purchase_amount && (
            <p className="text-xs text-brand-steel mt-1">Compra mínima: {formatPrice(coupon.min_purchase_amount)}</p>
          )}
          {coupon.max_discount_amount && (
            <p className="text-xs text-brand-steel">Descuento máximo: {formatPrice(coupon.max_discount_amount)}</p>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-xs text-brand-steel mb-4">
          <span>Válido hasta: {formatDate(coupon.valid_until)}</span>
          {coupon.max_uses && (
            <span>{coupon.current_uses}/{coupon.max_uses} usos</span>
          )}
        </div>

        {/* Copy button */}
        {active && (
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-wine/10 border border-brand-wine/20 text-brand-rose text-sm font-medium hover:bg-brand-wine hover:text-white transition-colors"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar código</>}
          </button>
        )}
        {!active && (
          <div className="text-center text-xs text-brand-steel py-2">
            {isExpired ? 'Cupón expirado' : isExhausted ? 'Usos agotados' : 'Cupón inactivo'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PromotionsPage() {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons-public'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.coupons, { params: { is_active: 'true', page_size: 50 } })
      if ('results' in data) return data.results?.cupones ?? data.results ?? []
      return data.cupones ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const active   = coupons.filter((c: Coupon) => c.is_active && new Date(c.valid_until) >= new Date())
  const inactive = coupons.filter((c: Coupon) => !c.is_active || new Date(c.valid_until) < new Date())

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">Ofertas especiales</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Promociones y cupones</h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto">
            Usa estos códigos al momento de tu reserva para obtener descuentos exclusivos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-brand-dark animate-pulse" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-center gap-4">
            <Tag className="h-16 w-16 text-brand-steel/30" />
            <h2 className="text-2xl font-bold text-white">No hay promociones activas</h2>
            <p className="text-brand-silver">Vuelve pronto para ver nuevas ofertas.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {active.length > 0 && (
              <div>
                <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Cupones activos ({active.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.map((c: Coupon) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </div>
            )}
            {inactive.length > 0 && (
              <div>
                <h2 className="font-semibold text-brand-steel mb-6 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Expirados / Inactivos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactive.map((c: Coupon) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
