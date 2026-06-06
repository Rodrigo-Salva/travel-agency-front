'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const FAQS = [
  {
    category: 'Reservas',
    items: [
      {
        q: '¿Cómo reservo un paquete de viaje?',
        a: 'Selecciona el paquete que te interesa, haz clic en "Reservar ahora" y sigue los pasos del asistente de reserva. Necesitarás una cuenta registrada. El proceso toma menos de 5 minutos.',
      },
      {
        q: '¿Puedo modificar mi reserva después de confirmarla?',
        a: 'Sí, puedes modificar fechas y número de pasajeros hasta 72 horas antes del viaje sin costo adicional. Para cambios después de ese plazo, contáctanos directamente y evaluamos caso a caso.',
      },
      {
        q: '¿Cuánto tiempo antes debo reservar?',
        a: 'Recomendamos reservar con al menos 2 semanas de anticipación para asegurar disponibilidad. Para temporada alta (julio, diciembre, enero) lo ideal es hacerlo con 2-3 meses de anticipación.',
      },
      {
        q: '¿Puedo cancelar mi reserva?',
        a: 'Sí. Las cancelaciones realizadas con más de 15 días de anticipación tienen reembolso completo. Entre 7 y 15 días: 50% de reembolso. Menos de 7 días: sin reembolso, pero puedes reprogramar sin costo.',
      },
    ],
  },
  {
    category: 'Pagos',
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencia bancaria y pago en efectivo en nuestras oficinas. También ofrecemos pago en cuotas sin interés con tarjetas seleccionadas.',
      },
      {
        q: '¿Es seguro pagar en línea?',
        a: 'Absolutamente. Utilizamos encriptación SSL de 256 bits y procesamos pagos a través de Stripe, uno de los procesadores más seguros del mundo. Nunca almacenamos los datos de tu tarjeta.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí. Ofrecemos hasta 12 cuotas sin interés con tarjetas de crédito participantes. Al momento de pagar, selecciona la opción de cuotas y elige la cantidad que mejor te convenga.',
      },
      {
        q: '¿Cuándo se hace efectivo el cargo a mi tarjeta?',
        a: 'El cargo se realiza al momento de confirmar la reserva. Si pagas con transferencia, tienes 48 horas para realizarla y la reserva queda pendiente hasta que confirmemos el depósito.',
      },
    ],
  },
  {
    category: 'Paquetes y servicios',
    items: [
      {
        q: '¿Qué incluye un paquete "todo incluido"?',
        a: 'Los paquetes todo incluido cubren: vuelos de ida y vuelta, hotel, traslados aeropuerto-hotel, desayuno diario y guía turístico. Algunos incluyen también cenas y actividades especiales — revisa el detalle de cada paquete.',
      },
      {
        q: '¿Puedo personalizar un paquete?',
        a: 'Sí. Nuestros asesores pueden armar un itinerario completamente personalizado según tus fechas, presupuesto y preferencias. Contáctanos y te enviamos una propuesta sin costo en menos de 24 horas.',
      },
      {
        q: '¿Los precios incluyen impuestos?',
        a: 'Todos los precios mostrados en la plataforma incluyen impuestos locales. El precio final que ves al confirmar es exactamente lo que pagarás, sin sorpresas.',
      },
      {
        q: '¿Hay descuentos para niños?',
        a: 'Sí. Niños de 2 a 11 años tienen entre 20% y 40% de descuento según el paquete. Bebés menores de 2 años generalmente viajan gratis si no ocupan asiento de avión. Los precios para niños se muestran en el detalle de cada paquete.',
      },
    ],
  },
  {
    category: 'Antes del viaje',
    items: [
      {
        q: '¿Necesito seguro de viaje?',
        a: 'Todos nuestros paquetes incluyen seguro de viaje básico (asistencia médica y cancelación). Si deseas cobertura adicional (pérdida de equipaje, deportes extremos, cobertura mayor), podemos incluirlo al costo del paquete.',
      },
      {
        q: '¿Qué documentos necesito para viajar?',
        a: 'Necesitas pasaporte vigente (con al menos 6 meses de validez al retorno). Según el destino, puede requerirse visa. Te informamos los requisitos específicos al momento de la reserva y te ayudamos con el trámite si lo necesitas.',
      },
      {
        q: '¿Cuándo recibo los documentos de viaje?',
        a: 'Una vez confirmado el pago, recibes el voucher de reserva por correo electrónico en menos de 2 horas. Los tickets de vuelo y vouchers de hotel los recibes entre 7 y 10 días antes de la salida.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'border-brand-wine/30 bg-brand-dark' : 'border-brand-steel/10 bg-brand-dark hover:border-brand-steel/25'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className={`font-medium text-sm leading-snug transition-colors ${open ? 'text-brand-rose' : 'text-white'}`}>{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${open ? 'bg-brand-wine text-white' : 'bg-brand-steel/10 text-brand-steel'}`}>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-brand-steel/10 pt-4">
          <p className="text-brand-silver/80 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat =>
    cat.items.length > 0 && (!activeCategory || cat.category === activeCategory)
  )

  const totalResults = filtered.reduce((acc, c) => acc + c.items.length, 0)

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="section-label mb-3">Centro de ayuda</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4 leading-tight">
            Preguntas <span className="text-gradient-brand italic">frecuentes</span>
          </h1>
          <p className="text-brand-silver/70 text-lg max-w-xl mx-auto mb-8">
            Encuentra respuestas rápidas a las dudas más comunes sobre nuestros servicios.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en las preguntas frecuentes..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-brand-darkest border border-brand-steel/20 text-white placeholder:text-brand-steel/50 text-sm focus:outline-none focus:border-brand-wine/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-steel hover:text-white transition-colors text-xs">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${!activeCategory ? 'bg-brand-wine text-white' : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'}`}
            >
              Todas
            </button>
            {FAQS.map(cat => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeCategory === cat.category ? 'bg-brand-wine text-white' : 'bg-brand-dark border border-brand-steel/20 text-brand-silver hover:border-brand-wine/40 hover:text-white'}`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Results */}
          {search && (
            <p className="text-brand-steel text-sm mb-6">{totalResults} resultado{totalResults !== 1 ? 's' : ''} para "{search}"</p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-brand-steel/20 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Sin resultados</p>
              <p className="text-brand-silver/60 text-sm">Intenta con otros términos o contáctanos directamente.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map(cat => (
                <div key={cat.category}>
                  <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-brand-wine inline-block" />
                    {cat.category}
                  </h2>
                  <div className="space-y-2">
                    {cat.items.map(item => (
                      <FAQItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-brand-dark border border-brand-steel/10 p-8 text-center">
            <p className="text-white font-semibold text-lg mb-2">¿No encontraste lo que buscabas?</p>
            <p className="text-brand-silver/70 text-sm mb-6">Nuestro equipo responde en menos de 2 horas en horario laboral.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={ROUTES.contact}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-all glow-wine-sm">
                <Mail className="h-4 w-4" /> Escribirnos
              </Link>
              <a href="https://wa.me/51999999999"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:bg-brand-dark text-sm font-semibold transition-all">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href="tel:+51999999999"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver hover:text-white hover:bg-brand-dark text-sm font-semibold transition-all">
                <Phone className="h-4 w-4" /> Llamar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
