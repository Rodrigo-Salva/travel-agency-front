'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, Plus, Minus, Users, Baby, UserCircle2, Tag, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

interface Props {
  packageId: number
  priceAdult: string
  priceChild: string
  discountedPriceAdult?: string | null
  discountPercentage?: string | null
  minPeople: number
  maxPeople: number
  availableSpots?: number | null
  isSoldOut?: boolean
}

function Counter({
  label, icon, value, onInc, onDec, min = 0, max = 20,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onInc: () => void
  onDec: () => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-brand-silver">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          disabled={value <= min}
          className="w-7 h-7 rounded-full border border-brand-steel/25 flex items-center justify-center text-brand-silver hover:border-brand-wine/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-white font-semibold text-sm">{value}</span>
        <button
          onClick={onInc}
          disabled={value >= max}
          className="w-7 h-7 rounded-full border border-brand-steel/25 flex items-center justify-center text-brand-silver hover:border-brand-wine/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export function PriceCalculator({
  packageId, priceAdult, priceChild, discountedPriceAdult,
  discountPercentage, minPeople, maxPeople, availableSpots, isSoldOut,
}: Props) {
  const [adults, setAdults] = useState(Math.max(1, minPeople))
  const [children, setChildren] = useState(0)

  const effectivePriceAdult = parseFloat(discountedPriceAdult ?? priceAdult)
  const effectivePriceChild  = parseFloat(priceChild)
  const hasDiscount = discountPercentage && parseFloat(String(discountPercentage)) > 0

  const totalPax    = adults + children
  const totalAdults = adults * effectivePriceAdult
  const totalKids   = children * effectivePriceChild
  const grandTotal  = totalAdults + totalKids

  const overMax = totalPax > maxPeople
  const underMin = totalPax < minPeople

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-steel/10 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-brand-wine" />
        <h3 className="text-sm font-semibold text-white">Calcula tu precio</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Counters */}
        <Counter
          label="Adultos"
          icon={<UserCircle2 className="w-4 h-4 text-brand-wine" />}
          value={adults}
          onInc={() => setAdults(a => Math.min(a + 1, maxPeople))}
          onDec={() => setAdults(a => Math.max(a - 1, 1))}
          min={1}
          max={maxPeople}
        />
        <Counter
          label="Niños"
          icon={<Baby className="w-4 h-4 text-brand-wine" />}
          value={children}
          onInc={() => setChildren(c => Math.min(c + 1, maxPeople - adults))}
          onDec={() => setChildren(c => Math.max(c - 1, 0))}
          min={0}
          max={maxPeople - adults}
        />

        {/* Grupo info */}
        <div className="flex items-center gap-1.5 text-xs text-brand-steel pt-1">
          <Users className="w-3.5 h-3.5" />
          <span>Grupo: {minPeople}–{maxPeople} personas</span>
          {overMax && <span className="text-red-400 ml-1">· Excede el máximo</span>}
          {underMin && <span className="text-amber-400 ml-1">· Mínimo {minPeople}</span>}
        </div>

        {/* Breakdown */}
        <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-brand-silver">
            <span>
              {adults} adulto{adults !== 1 ? 's' : ''}
              {hasDiscount && (
                <span className="ml-1.5 text-[10px] bg-brand-wine/20 text-brand-rose px-1.5 py-0.5 rounded-full">
                  -{parseFloat(String(discountPercentage)).toFixed(0)}%
                </span>
              )}
            </span>
            <span>{formatPrice(String(totalAdults))}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between text-brand-silver">
              <span>{children} niño{children !== 1 ? 's' : ''}</span>
              <span>{formatPrice(String(totalKids))}</span>
            </div>
          )}
          <div className="border-t border-brand-steel/10 pt-2 flex justify-between font-bold text-white text-base">
            <span>Total estimado</span>
            <span className="text-brand-rose">{formatPrice(String(grandTotal))}</span>
          </div>
          <p className="text-[11px] text-brand-steel text-center pt-1">* Precio orientativo sin impuestos</p>
        </div>

        {/* Cupos badge */}
        {isSoldOut && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Este paquete está agotado. Consulta otro disponible.
          </div>
        )}
        {!isSoldOut && availableSpots !== null && availableSpots !== undefined && availableSpots <= 5 && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            ¡Solo quedan {availableSpots} cupos disponibles!
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && !isSoldOut && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-2">
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            Descuento del {parseFloat(String(discountPercentage)).toFixed(0)}% ya aplicado
          </div>
        )}

        {/* CTA */}
        {isSoldOut ? (
          <div className="block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm bg-brand-steel/20 text-brand-steel cursor-not-allowed">
            Sin cupos disponibles
          </div>
        ) : (
          <Link
            href={`${ROUTES.customer.newBooking}?package=${packageId}&adults=${adults}&children=${children}`}
            className={`block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              overMax || underMin
                ? 'bg-brand-steel/20 text-brand-steel cursor-not-allowed pointer-events-none'
                : 'bg-brand-wine text-white hover:bg-brand-wine/90'
            }`}
          >
            Reservar {totalPax} {totalPax === 1 ? 'persona' : 'personas'}
          </Link>
        )}
      </div>
    </div>
  )
}
