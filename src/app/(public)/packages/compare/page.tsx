'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  X,
  Plus,
  CheckCircle2,
  XCircle,
  Plane,
  Hotel,
  UtensilsCrossed,
  Car,
  UserCheck,
  Star,
  Clock,
  Users,
} from 'lucide-react'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice, formatDuration } from '@/lib/utils/format'
import type { PackageDetail, PackageSummary } from '@/features/packages/types/package.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

function getImage(pkg: PackageSummary) {
  if (!pkg.image) return null
  return pkg.image.startsWith('http') ? pkg.image : `${BASE_URL}${pkg.image}`
}

function BoolCell({ value }: { value: boolean }) {
  return value
    ? <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" />
    : <XCircle className="h-5 w-5 text-brand-steel/30 mx-auto" />
}

const INCLUDES = [
  { key: 'includes_flight',    label: 'Vuelo',          icon: <Plane className="h-3.5 w-3.5" /> },
  { key: 'includes_hotel',     label: 'Hotel',          icon: <Hotel className="h-3.5 w-3.5" /> },
  { key: 'includes_meals',     label: 'Comidas',        icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { key: 'includes_transport', label: 'Transporte',     icon: <Car className="h-3.5 w-3.5" /> },
  { key: 'includes_guide',     label: 'Guía turístico', icon: <UserCheck className="h-3.5 w-3.5" /> },
] as const

function PackageSelector({
  selected,
  all,
  onSelect,
  onRemove,
}: {
  selected: PackageSummary | null
  all: PackageSummary[]
  onSelect: (p: PackageSummary) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)

  if (selected) {
    const img = getImage(selected)
    return (
      <div className="relative rounded-2xl bg-brand-dark border border-brand-steel/20 overflow-hidden">
        <div className="h-36 relative bg-brand-darkest">
          {img
            ? <Image src={img} alt={selected.name} fill className="object-cover" sizes="300px" />
            : <div className="absolute inset-0 bg-gradient-to-b from-brand-wine/20 to-brand-dark" />}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
        </div>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-darkest/80 text-brand-steel hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="p-4">
          <p className="font-semibold text-white text-sm leading-snug line-clamp-2">{selected.name}</p>
          <p className="text-xs text-brand-steel mt-0.5">{selected.category_name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-full min-h-[160px] rounded-2xl border-2 border-dashed border-brand-steel/20 hover:border-brand-wine/40 transition-colors flex flex-col items-center justify-center gap-2 text-brand-steel hover:text-brand-silver"
      >
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Agregar paquete</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-brand-dark border border-brand-steel/20 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {all.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false) }}
              className="w-full px-4 py-3 text-left hover:bg-brand-darkest/60 transition-colors border-b border-brand-steel/10 last:border-0"
            >
              <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
              <p className="text-xs text-brand-steel mt-0.5">{formatPrice(p.price_adult)} · {formatDuration(p.duration_days, p.duration_nights)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComparePackagesPage() {
  const { data: packagesData, isLoading } = usePackages({ page_size: 50, is_active: true })
  const all = useMemo(() => packagesData?.packages ?? [], [packagesData])

  const [slots, setSlots] = useState<(PackageSummary | null)[]>([null, null, null])

  const selected = slots.filter(Boolean) as PackageSummary[]

  function setSlot(index: number, pkg: PackageSummary | null) {
    setSlots((prev) => prev.map((s, i) => (i === index ? pkg : s)))
  }

  const availableForSlot = (slotIndex: number) =>
    all.filter((p) => !slots.some((s, i) => s?.id === p.id && i !== slotIndex))

  const colCount = slots.length + 1

  return (
    <div className="min-h-screen bg-brand-darkest py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={ROUTES.packages}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Paquetes
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Comparar paquetes</h1>
            <p className="text-brand-steel text-sm mt-0.5">Selecciona hasta 3 paquetes para compararlos lado a lado</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-brand-dark animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Selectors row */}
            <div className={`grid gap-4 mb-10`} style={{ gridTemplateColumns: `200px repeat(3, 1fr)` }}>
              <div />
              {slots.map((slot, i) => (
                <PackageSelector
                  key={i}
                  selected={slot}
                  all={availableForSlot(i)}
                  onSelect={(p) => setSlot(i, p)}
                  onRemove={() => setSlot(i, null)}
                />
              ))}
            </div>

            {selected.length > 0 && (
              <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
                {/* Comparison table */}
                <CompareTable slots={slots} />
              </div>
            )}

            {selected.length === 0 && (
              <div className="text-center py-16 text-brand-steel">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-brand-silver">Selecciona al menos un paquete para comparar</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CompareTable({ slots }: { slots: (PackageSummary | null)[] }) {
  const rows: { label: string; render: (p: PackageSummary) => React.ReactNode; icon?: React.ReactNode }[] = [
    {
      label: 'Precio adulto',
      icon: null,
      render: (p) => <span className="font-display text-xl font-bold text-white">{formatPrice(p.price_adult)}</span>,
    },
    {
      label: 'Precio niño',
      render: (p) =>
        p.price_child && parseFloat(p.price_child) > 0
          ? <span className="text-brand-silver text-sm">{formatPrice(p.price_child)}</span>
          : <span className="text-brand-steel/40 text-xs">—</span>,
    },
    {
      label: 'Duración',
      icon: <Clock className="h-3.5 w-3.5" />,
      render: (p) => <span className="text-white text-sm">{formatDuration(p.duration_days, p.duration_nights)}</span>,
    },
    {
      label: 'Categoría',
      render: (p) => <span className="text-brand-silver text-sm">{p.category_name}</span>,
    },
  ]

  return (
    <table className="w-full">
      <colgroup>
        <col style={{ width: '200px' }} />
        {slots.map((_, i) => <col key={i} />)}
      </colgroup>

      {/* Includes section */}
      <tbody>
        <tr className="border-b border-brand-steel/10">
          <td className="px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider" colSpan={slots.length + 1}>
            Precio y duración
          </td>
        </tr>
        {rows.map(({ label, render, icon }) => (
          <tr key={label} className="border-b border-brand-steel/10 hover:bg-brand-darkest/30 transition-colors">
            <td className="px-5 py-3.5 text-sm text-brand-silver">
              <span className="flex items-center gap-1.5">{icon}{label}</span>
            </td>
            {slots.map((p, i) => (
              <td key={i} className="px-5 py-3.5 text-center">
                {p ? render(p) : <span className="text-brand-steel/20">—</span>}
              </td>
            ))}
          </tr>
        ))}

        <tr className="border-b border-brand-steel/10">
          <td className="px-5 py-3 text-xs font-semibold text-brand-steel uppercase tracking-wider" colSpan={slots.length + 1}>
            ¿Qué incluye?
          </td>
        </tr>
        {INCLUDES.map(({ key, label, icon }) => (
          <tr key={key} className="border-b border-brand-steel/10 hover:bg-brand-darkest/30 transition-colors">
            <td className="px-5 py-3.5 text-sm text-brand-silver">
              <span className="flex items-center gap-1.5">{icon}{label}</span>
            </td>
            {slots.map((p, i) => (
              <td key={i} className="px-5 py-3.5 text-center">
                {p ? <BoolCell value={(p as any)[key]} /> : <span className="text-brand-steel/20">—</span>}
              </td>
            ))}
          </tr>
        ))}

        {/* CTA row */}
        <tr>
          <td className="px-5 py-4" />
          {slots.map((p, i) => (
            <td key={i} className="px-5 py-4 text-center">
              {p ? (
                <Link
                  href={ROUTES.package(p.id)}
                  className="inline-block px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
                >
                  Ver detalles
                </Link>
              ) : null}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}
