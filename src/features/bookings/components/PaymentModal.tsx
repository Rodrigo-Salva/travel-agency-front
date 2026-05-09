'use client'

import { useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Loader2, CreditCard, ShieldCheck } from 'lucide-react'
import { bookingsApi } from '../api/bookings.api'
import { formatPrice } from '@/lib/utils/format'

// loadStripe se llama fuera del componente para no re-crear la instancia en cada render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ABAFB5',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#677E8A' },
      iconColor: '#677E8A',
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
  hidePostalCode: true,
}

// ─── Formulario interior (debe vivir dentro de <Elements>) ───────────────────

interface PaymentFormProps {
  bookingId: number
  clientSecret: string
  paymentIntentId: string
  totalAmount: string
  onSuccess: () => void
  onClose: () => void
}

function PaymentForm({ bookingId, clientSecret, paymentIntentId, totalAmount, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const qc = useQueryClient()
  const [cardError, setCardError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const confirmMutation = useMutation({
    mutationFn: () => bookingsApi.confirmPayment(bookingId, paymentIntentId),
    onSuccess: (data) => {
      toast.success(data.mensaje)
      qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      qc.invalidateQueries({ queryKey: ['bookings'] })
      onSuccess()
    },
    onError: () => {
      toast.error('El pago fue procesado pero hubo un error al confirmar. Contacta soporte.')
    },
  })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setCardError(null)
    setConfirming(true)

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    setConfirming(false)

    if (error) {
      setCardError(error.message ?? 'Error al procesar el pago.')
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      confirmMutation.mutate()
    }
  }, [stripe, elements, clientSecret, confirmMutation])

  const isPending = confirming || confirmMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Monto */}
      <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 p-4 flex justify-between items-center">
        <span className="text-brand-silver text-sm">Total a pagar</span>
        <span className="font-display text-xl font-bold text-white">{formatPrice(totalAmount)}</span>
      </div>

      {/* Campo de tarjeta */}
      <div>
        <label className="block text-xs text-brand-steel uppercase tracking-wider mb-2">
          Datos de tarjeta
        </label>
        <div className="rounded-xl border border-brand-steel/20 bg-brand-darkest/40 px-4 py-3.5 focus-within:border-brand-wine/50 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setCardError(null)} />
        </div>
        {cardError && <p className="mt-2 text-xs text-red-400">{cardError}</p>}
      </div>

      {/* Ayuda modo test */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
        <p className="text-xs text-amber-400 font-medium mb-1">Modo de prueba</p>
        <p className="text-xs text-amber-300/70">
          Usa <span className="font-mono">4242 4242 4242 4242</span>, fecha futura (ej.{' '}
          <span className="font-mono">12/34</span>) y CVV <span className="font-mono">123</span>.
        </p>
      </div>

      {/* Badge de seguridad */}
      <div className="flex items-center gap-2 text-xs text-brand-steel">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
        Pago seguro procesado por Stripe. Tus datos nunca pasan por nuestros servidores.
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
            : <><CreditCard className="h-4 w-4" /> Pagar ahora</>
          }
        </button>
      </div>
    </form>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────

interface PaymentModalProps {
  bookingId: number
  totalAmount: string
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ bookingId, totalAmount, onClose, onSuccess }: PaymentModalProps) {
  const [intentData, setIntentData] = useState<{ clientSecret: string; paymentIntentId: string } | null>(null)

  const createIntent = useMutation({
    mutationFn: () => bookingsApi.createPaymentIntent(bookingId),
    onSuccess: (data) => {
      setIntentData({ clientSecret: data.client_secret, paymentIntentId: data.payment_intent_id })
    },
    onError: () => {
      toast.error('No se pudo iniciar el proceso de pago. Intenta de nuevo.')
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-brand-dark border border-brand-steel/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-steel/10">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-wine" />
            <h2 className="font-semibold text-white text-base">Pagar reserva</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!intentData ? (
            // Paso 1: confirmación antes de crear el PaymentIntent
            <div className="space-y-5">
              <div className="rounded-xl bg-brand-darkest/60 border border-brand-steel/10 p-4 flex justify-between items-center">
                <span className="text-brand-silver text-sm">Total a pagar</span>
                <span className="font-display text-xl font-bold text-white">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-brand-silver text-sm text-center">
                Ingresarás los datos de tu tarjeta de forma segura a través de Stripe.
              </p>
              <button
                onClick={() => createIntent.mutate()}
                disabled={createIntent.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
              >
                {createIntent.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparando pago...</>
                  : <><CreditCard className="h-4 w-4" /> Continuar al pago</>
                }
              </button>
            </div>
          ) : (
            // Paso 2: formulario de tarjeta con Stripe Elements
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingId={bookingId}
                clientSecret={intentData.clientSecret}
                paymentIntentId={intentData.paymentIntentId}
                totalAmount={totalAmount}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
