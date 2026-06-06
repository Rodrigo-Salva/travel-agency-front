'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Flame, Tag, Clock, Package, ArrowRight, Sparkles, Percent, Filter } from 'lucide-react'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { ROUTES } from '@/lib/constants/routes'

// ── Countdown timer ──────────────────────────────────────────────────────────
function useCountdown(targetMs: number) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    function tick() {
      const diff = targetMs - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return t
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl bg-brand-darkest border border-brand-wine/30 flex items-center justify-center">
        <span className="font-display text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-brand-steel uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

const DEAL_TABS = [
  { key: 'all',      label: 'Todas',         icon: Sparkles },
  { key: 'flash',    label: 'Flash deals',   icon: Flame },
  { key: 'discount', label: 'Más descuento', icon: Percent },
]

export default function OfertasPage() {
  const [tab, setTab] = useState<'all' | 'flash' | 'discount'>('all')

  // Paquetes con descuento
  const { data: discountedData, isLoading: loadingDiscount } = usePackages({
    page_size: 12,
    ordering: '-discount_percentage',
  })

  // Paquetes destacados (flash deals)
  const { data: featuredData, isLoading: loadingFeatured } = usePackages({
    is_featured: true,
    page_size: 8,
    ordering: '-created_at',
  })

  // Deadline de oferta: fin del mes actual (memoizado para evitar recrear Date cada render)
  const deadlineMs = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + 1)
    d.setHours(23, 59, 59, 0)
    return d.getTime()
  }, [])
  const countdown = useCountdown(deadlineMs)

  // Filtrar solo los que tienen descuento
  const withDiscount = (discountedData?.packages ?? []).filter(
    p => p.discount_percentage && parseFloat(String(p.discount_percentage)) > 0
  )
  const featured = featuredData?.packages ?? []

  const displayPackages =
    tab === 'flash'    ? featured :
    tab === 'discount' ? [...withDiscount].sort((a, b) =>
        parseFloat(String(b.discount_percentage ?? 0)) - parseFloat(String(a.discount_percentage ?? 0))
      ) :
    // all: mezcla únicos por id, descuentos primero
    [
      ...withDiscount,
      ...featured.filter(f => !withDiscount.find(d => d.id === f.id)),
    ]

  const isLoading = loadingDiscount || loadingFeatured
  const isEmpty = !isLoading && displayPackages.length === 0

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-wine/25 via-brand-dark to-brand-darkest pt-20 pb-16">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-wine/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-rose/5 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-2 text-brand-rose text-xs font-bold uppercase tracking-widest mb-4">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            Tiempo limitado
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Ofertas <span className="text-gradient-brand">exclusivas</span>
          </h1>
          <p className="text-brand-silver text-lg max-w-xl mb-8">
            Los mejores precios en paquetes seleccionados. Aprovecha antes de que se acaben.
          </p>

          {/* Countdown */}
          <div className="inline-flex flex-col gap-3">
            <div className="flex items-center gap-2 text-brand-steel text-xs">
              <Clock className="h-3.5 w-3.5" />
              Oferta válida hasta fin de mes
            </div>
            <div className="flex items-center gap-3">
              <CountdownUnit value={countdown.d} label="días" />
              <span className="text-brand-wine text-2xl font-bold mb-5">:</span>
              <CountdownUnit value={countdown.h} label="horas" />
              <span className="text-brand-wine text-2xl font-bold mb-5">:</span>
              <CountdownUnit value={countdown.m} label="min" />
              <span className="text-brand-wine text-2xl font-bold mb-5">:</span>
              <CountdownUnit value={countdown.s} label="seg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-brand-dark border-b border-brand-steel/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-8 overflow-x-auto">
          {[
            { label: 'Paquetes en oferta', value: withDiscount.length || '—' },
            { label: 'Deals destacados',   value: featured.length || '—' },
            { label: 'Descuento máximo',   value: withDiscount.length
              ? `-${Math.max(...withDiscount.map(p => parseFloat(String(p.discount_percentage ?? 0)))).toFixed(0)}%`
              : '—'
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex-shrink-0 text-center">
              <p className="font-display text-2xl font-bold text-brand-rose">{value}</p>
              <p className="text-brand-steel text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {DEAL_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-brand-wine text-white shadow-lg shadow-brand-wine/25'
                  : 'bg-brand-dark border border-brand-steel/15 text-brand-silver hover:text-white hover:border-brand-steel/30'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 text-brand-steel text-xs">
            <Filter className="h-3.5 w-3.5" />
            <span>{isLoading ? '…' : `${displayPackages.length} resultados`}</span>
          </div>
        </div>

        {/* Flash deals banner */}
        {tab === 'flash' && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-brand-wine/20 to-transparent border border-brand-wine/20 flex items-start gap-3">
            <Flame className="h-5 w-5 text-brand-wine flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-white font-semibold text-sm">Flash Deals — Paquetes destacados</p>
              <p className="text-brand-silver text-xs mt-0.5">
                Paquetes seleccionados por nuestro equipo. Disponibilidad limitada.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <PackageCardSkeleton key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center py-24 text-center gap-4">
            <Tag className="h-16 w-16 text-brand-steel/30" />
            <p className="text-white text-xl font-bold">Sin ofertas disponibles</p>
            <p className="text-brand-silver text-sm max-w-xs">
              Vuelve pronto — actualizamos las ofertas regularmente.
            </p>
            <Link
              href={ROUTES.packages}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              Ver todos los paquetes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* CTA bottom */}
        {!isEmpty && !isLoading && (
          <div className="mt-14 text-center">
            <p className="text-brand-silver text-sm mb-4">¿No encontraste lo que buscas?</p>
            <Link
              href={ROUTES.packages}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:bg-brand-dark transition-all text-sm font-medium"
            >
              <Package className="h-4 w-4" />
              Ver todos los paquetes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
