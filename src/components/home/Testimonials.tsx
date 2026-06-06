'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'María González',
    role: 'Viajera frecuente',
    location: 'Lima, Perú',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    rating: 5,
    text: 'Increíble experiencia de principio a fin. El paquete a Cusco superó todas mis expectativas. La atención al detalle y el soporte 24/7 me dieron total tranquilidad durante todo el viaje.',
    trip: 'Cusco & Machu Picchu',
    date: 'Enero 2025',
  },
  {
    id: 2,
    name: 'Carlos Ramírez',
    role: 'Fotógrafo de viajes',
    location: 'Bogotá, Colombia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    rating: 5,
    text: 'Reservé el tour por el Caribe y fue absolutamente mágico. Todo estaba perfectamente organizado: vuelos, hotel boutique y las actividades. Volveré a reservar sin duda.',
    trip: 'Caribe Premium',
    date: 'Diciembre 2024',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    role: 'Ejecutiva de marketing',
    location: 'Buenos Aires, Argentina',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    rating: 5,
    text: 'Mi familia y yo disfrutamos de Europa como nunca. 15 días perfectamente planificados, los hoteles de primera calidad y los guías locales hacen la diferencia. 100% recomendado.',
    trip: 'Europa Clásica 15D',
    date: 'Noviembre 2024',
  },
  {
    id: 4,
    name: 'Diego Herrera',
    role: 'Emprendedor',
    location: 'Santiago, Chile',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
    rating: 5,
    text: 'Llevaba años queriendo hacer el Camino Inca y gracias a esta agencia fue una realidad. Cada detalle pensado, cada momento inolvidable. El mejor viaje de mi vida.',
    trip: 'Camino Inca 4D',
    date: 'Octubre 2024',
  },
  {
    id: 5,
    name: 'Valentina López',
    role: 'Docente universitaria',
    location: 'Medellín, Colombia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
    rating: 5,
    text: 'El paquete a Japón fue una experiencia transformadora. La agencia gestionó absolutamente todo, incluso la traducción en momentos complicados. Volví con el corazón lleno.',
    trip: 'Japón Esencial 12D',
    date: 'Septiembre 2024',
  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

export function Testimonials() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return
    timeoutRef.current = setTimeout(() => {
      setActive(a => (a + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [active, paused])

  function prev() { setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length) }
  function next() { setActive(a => (a + 1) % TESTIMONIALS.length) }

  const t = TESTIMONIALS[active]

  return (
    <section className="py-24 bg-brand-darkest relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(98,35,71,0.06) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label mb-3">Testimonios</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Lo que dicen nuestros <span className="text-gradient-brand italic">viajeros</span>
          </h2>
          <p className="text-brand-silver/70 mt-4 max-w-lg mx-auto">
            Más de 10,000 viajeros han confiado en nosotros. Estas son sus historias.
          </p>
        </div>

        {/* Main card */}
        <div
          className="max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative rounded-2xl bg-brand-dark border border-brand-steel/10 card-depth p-8 sm:p-10 transition-all duration-500">
            {/* Quote icon */}
            <div className="absolute -top-4 left-8 w-10 h-10 rounded-xl bg-brand-wine flex items-center justify-center shadow-lg">
              <Quote className="h-5 w-5 text-white fill-white" />
            </div>

            {/* Stars */}
            <div className="flex items-center justify-between mb-6 pt-2">
              <StarRow rating={t.rating} />
              <span className="text-xs text-brand-steel bg-brand-darkest border border-brand-steel/15 rounded-full px-3 py-1">
                {t.trip}
              </span>
            </div>

            {/* Text */}
            <blockquote className="text-brand-silver/90 text-lg leading-relaxed mb-8 font-light italic">
              "{t.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-wine/30 flex-shrink-0">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-brand-steel">{t.role} · {t.location}</p>
                </div>
              </div>
              <span className="text-xs text-brand-steel/50">{t.date}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev}
              className="w-10 h-10 rounded-full border border-brand-steel/20 text-brand-steel hover:border-brand-wine/50 hover:text-brand-rose transition-all flex items-center justify-center">
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 h-2 bg-brand-wine' : 'w-2 h-2 bg-brand-steel/30 hover:bg-brand-steel/60'
                  }`} />
              ))}
            </div>

            <button onClick={next}
              className="w-10 h-10 rounded-full border border-brand-steel/20 text-brand-steel hover:border-brand-wine/50 hover:text-brand-rose transition-all flex items-center justify-center">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mini cards row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <button key={t.id} onClick={() => setActive(i)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                i === active
                  ? 'border-brand-wine/40 bg-brand-wine/8'
                  : 'border-brand-steel/10 bg-brand-dark/40 hover:border-brand-steel/30'
              }`}>
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="36px" />
              </div>
              <p className="text-[10px] text-brand-silver/70 text-center leading-tight line-clamp-1">{t.name.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
