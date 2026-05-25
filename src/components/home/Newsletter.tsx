'use client'

import { useState } from 'react'
import { Send, CheckCircle, Loader2, Mail, Gift } from 'lucide-react'
import { FadeIn } from '@/components/ui/FadeIn'

export function Newsletter() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      setMessage('Ingresa un correo electrónico válido.')
      return
    }
    setStatus('loading')
    // Simulate API call — replace with real endpoint when backend is ready
    await new Promise(r => setTimeout(r, 1200))
    setStatus('success')
    setMessage('¡Listo! Revisa tu bandeja de entrada para confirmar tu suscripción.')
    setEmail('')
  }

  return (
    <section className="py-20 bg-brand-dark relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(98,35,71,0.07) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative">
        <FadeIn className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="rounded-2xl bg-brand-darkest border border-brand-steel/10 card-depth p-8 sm:p-10 text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-brand-wine/15 border border-brand-wine/25 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-brand-rose" />
            </div>

            <p className="section-label mb-3">Newsletter</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              Ofertas exclusivas <span className="text-gradient-brand italic">antes que nadie</span>
            </h2>
            <p className="text-brand-silver/70 mb-8 leading-relaxed">
              Suscríbete y recibe descuentos de hasta 30% en paquetes seleccionados,<br className="hidden sm:block" />
              alertas de precios y guías de viaje gratuitas.
            </p>

            {/* Perks */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Descuentos exclusivos', 'Guías de viaje gratis', 'Sin spam, jamás'].map(perk => (
                <span key={perk} className="flex items-center gap-1.5 text-xs text-brand-silver/70 bg-brand-dark border border-brand-steel/15 rounded-full px-3 py-1.5">
                  <Gift className="h-3 w-3 text-brand-rose flex-shrink-0" />
                  {perk}
                </span>
              ))}
            </div>

            {status === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
                <p className="text-white font-semibold">¡Gracias por suscribirte!</p>
                <p className="text-brand-silver/70 text-sm">{message}</p>
                <button onClick={() => setStatus('idle')} className="text-xs text-brand-steel hover:text-brand-silver underline mt-2 transition-colors">
                  Suscribir otro correo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                    placeholder="tu@correo.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark border text-white placeholder:text-brand-steel/50 text-sm focus:outline-none transition-colors ${
                      status === 'error' ? 'border-red-500/50 focus:border-red-500' : 'border-brand-steel/20 focus:border-brand-wine/50'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold text-sm transition-all disabled:opacity-60 whitespace-nowrap glow-wine-sm"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Suscribirme</>
                  )}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2 text-left sm:text-center">{message}</p>
            )}

            <p className="text-brand-steel/40 text-xs mt-5">
              Al suscribirte aceptas nuestra política de privacidad. Puedes darte de baja en cualquier momento.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
