'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, Phone } from 'lucide-react'

const WHATSAPP_NUMBER = '51999999999' // reemplazar con número real
const WHATSAPP_MESSAGE = '¡Hola! Me interesa conocer más sobre sus paquetes de viaje. ¿Podrían ayudarme?'

export function WhatsAppButton() {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false)
  const [pulse, setPulse]     = useState(true)

  // Aparece después de 2 segundos
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Detiene el pulse después de 6 segundos
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000)
    return () => clearTimeout(t)
  }, [])

  function openWhatsApp() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup card */}
      <div className={`transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="w-72 rounded-2xl bg-brand-dark border border-brand-steel/15 card-depth overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54]">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-none mb-0.5">TravelAgency</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                En línea ahora
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="bg-brand-darkest rounded-xl rounded-tl-none p-3 mb-4 border border-brand-steel/10">
              <p className="text-brand-silver/90 text-sm leading-relaxed">
                ¡Hola! 👋 ¿En qué podemos ayudarte?
              </p>
              <p className="text-brand-silver/90 text-sm leading-relaxed mt-2">
                Cuéntanos el destino que tienes en mente y te armamos un paquete a medida. 🌍✈️
              </p>
              <p className="text-brand-steel/50 text-[10px] mt-1.5 text-right">hace un momento</p>
            </div>

            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: '#25D366' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#20bd5c'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#25D366'}
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              Chatear por WhatsApp
            </button>

            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm text-brand-silver/70 hover:text-brand-silver border border-brand-steel/15 hover:border-brand-steel/30 transition-all mt-2"
            >
              <Phone className="h-3.5 w-3.5" />
              Llamar: +51 999 999 999
            </button>
          </div>

          <p className="text-center text-[10px] text-brand-steel/40 pb-3">
            Respuesta en menos de 5 minutos
          </p>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}
        aria-label="Abrir chat WhatsApp"
      >
        {/* Pulse rings */}
        {pulse && !open && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#25D366' }} />
            <span className="absolute -inset-1 rounded-full animate-ping opacity-20 animation-delay-300" style={{ background: '#25D366' }} />
          </>
        )}

        {open
          ? <X className="h-6 w-6 transition-transform duration-200" />
          : <MessageCircle className="h-6 w-6 fill-white transition-transform duration-200" />
        }
      </button>
    </div>
  )
}
