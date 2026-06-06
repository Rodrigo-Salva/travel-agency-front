'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2, Download, Share2, Check, MapPin, Clock,
  Users, Calendar, CreditCard, ArrowRight, Home, Printer,
} from 'lucide-react'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { queryKeys } from '@/lib/query/keys'

interface Props {
  params: Promise<{ id: string }>
}

const CONFETTI_COLORS = ['#622347', '#E0B4B2', '#677E8A', '#c96a8a', '#fff']

function Confetti() {
  const [pieces, setPieces] = useState<{ x: number; color: string; delay: number; size: number }[]>([])

  useEffect(() => {
    setPieces(
      Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 1.5,
        size: 6 + Math.random() * 8,
      }))
    )
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm animate-bounce"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${1 + Math.random()}s`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  )
}

export default function BookingConfirmationPage({ params }: Props) {
  const { id } = use(params)
  const [copied, setCopied] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: queryKeys.bookings.detail(Number(id)),
    queryFn: () => bookingsApi.get(Number(id)),
  })

  const handleShare = async () => {
    const url = window.location.origin + ROUTES.customer.booking(Number(id))
    if (navigator.share) {
      await navigator.share({ title: `Reserva #${booking?.booking_number}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-wine/30 border-t-brand-wine animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-white text-xl font-bold">Reserva no encontrada</p>
        <Link href={ROUTES.customer.bookings} className="text-brand-rose hover:text-white transition-colors text-sm">
          Ver mis reservas →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero confetti section */}
      <div className="relative bg-gradient-to-b from-brand-wine/20 to-brand-darkest pt-16 pb-20 overflow-hidden">
        <Confetti />

        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          {/* Big checkmark */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            ¡Pago exitoso!
          </h1>
          <p className="text-brand-silver text-lg max-w-md">
            Tu reserva ha sido confirmada. Te esperamos para una experiencia increíble.
          </p>

          {/* Booking number badge */}
          <div className="mt-6 flex items-center gap-2 bg-brand-dark/80 border border-brand-steel/20 rounded-full px-5 py-2.5 backdrop-blur">
            <span className="text-brand-steel text-sm">Número de reserva:</span>
            <span className="font-mono font-bold text-brand-rose text-sm tracking-wider">
              #{booking.booking_number}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 -mt-6 pb-20 max-w-2xl space-y-4">

        {/* Summary card */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-steel/10">
            <h2 className="font-semibold text-white">Resumen de tu reserva</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Package/destination */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-brand-wine" />
              </div>
              <div>
                <p className="text-brand-steel text-xs uppercase tracking-wider">Reserva</p>
                <p className="text-white font-medium">#{booking.booking_number}</p>
              </div>
            </div>

            {/* Travel date */}
            {booking.travel_date && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-brand-wine" />
                </div>
                <div>
                  <p className="text-brand-steel text-xs uppercase tracking-wider">Fecha de viaje</p>
                  <p className="text-white font-medium">{formatDate(booking.travel_date)}</p>
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-brand-wine" />
              </div>
              <div>
                <p className="text-brand-steel text-xs uppercase tracking-wider">Pasajeros</p>
                <p className="text-white font-medium">
                  {booking.num_adults} adulto{booking.num_adults !== 1 ? 's' : ''}
                  {booking.num_children > 0 && `, ${booking.num_children} niño${booking.num_children !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Booking date */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-brand-wine" />
              </div>
              <div>
                <p className="text-brand-steel text-xs uppercase tracking-wider">Reservado el</p>
                <p className="text-white font-medium">{formatDate(booking.booking_date)}</p>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="border-t border-brand-steel/10 p-6 bg-brand-darkest/40">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Pago completado</span>
              <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Pagado
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-silver">
                <span>Subtotal</span>
                <span>{formatPrice(booking.subtotal)}</span>
              </div>
              {parseFloat(booking.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento</span>
                  <span>-{formatPrice(booking.discount_amount)}</span>
                </div>
              )}
              {parseFloat(booking.tax_amount) > 0 && (
                <div className="flex justify-between text-brand-silver">
                  <span>Impuestos</span>
                  <span>{formatPrice(booking.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-brand-steel/10">
                <span>Total pagado</span>
                <span className="text-emerald-400">{formatPrice(booking.paid_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6">
          <h3 className="font-semibold text-white mb-4">Próximos pasos</h3>
          <ol className="space-y-3">
            {[
              { n: 1, text: 'Recibirás un email de confirmación con todos los detalles.' },
              { n: 2, text: 'Descarga o imprime tu voucher de reserva.' },
              { n: 3, text: 'Presenta el número de reserva al llegar al destino.' },
              { n: 4, text: '¡Disfruta tu viaje!' },
            ].map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-wine/20 border border-brand-wine/30 text-brand-rose text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </span>
                <p className="text-brand-silver text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40 transition-all text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            Imprimir voucher
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40 transition-all text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Compartir'}
          </button>
        </div>

        <Link
          href={ROUTES.customer.booking(Number(id))}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-steel/20 text-brand-silver hover:text-white hover:border-brand-steel/40 transition-all text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Ver detalle completo y descargar PDF
        </Link>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href={ROUTES.customer.bookings}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:bg-brand-dark transition-all text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Mis reservas
          </Link>
          <Link
            href={ROUTES.packages}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-wine text-white hover:bg-brand-wine/90 transition-all text-sm font-semibold"
          >
            Explorar más
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
