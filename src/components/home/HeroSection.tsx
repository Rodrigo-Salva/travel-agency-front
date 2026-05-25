'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Users, ChevronDown } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80', tag: 'Naturaleza', title: 'Descubre el mundo', sub: 'con nosotros' },
  { img: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80', tag: 'Aventura',   title: 'Vive experiencias', sub: 'únicas' },
  { img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80', tag: 'Cultura',    title: 'Explora culturas',  sub: 'del mundo' },
]

const TABS = ['Paquetes', 'Destinos', 'Hoteles'] as const
type Tab = typeof TABS[number]

export function HeroSection() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [tab, setTab] = useState<Tab>('Paquetes')
  const [query, setQuery] = useState('')
  const [travelers, setTravelers] = useState(2)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  function handleSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    const routes: Record<Tab, string> = { Paquetes: ROUTES.packages, Destinos: ROUTES.destinations, Hoteles: ROUTES.hotels }
    router.push(`${routes[tab]}?${params.toString()}`)
  }

  const current = SLIDES[slide]

  return (
    <>
      <section className="relative min-h-[88vh] flex flex-col overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={s.img} alt={s.title} fill priority={i === 0} className="object-cover object-center" sizes="100vw" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-brand-darkest" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center container mx-auto px-4 py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-1.5 text-sm text-white/80 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-rose animate-pulse" />
            {current.tag} · Agencia #1 en Perú
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5 max-w-4xl">
            {current.title}{' '}
            <span className="text-gradient-brand">{current.sub}</span>
          </h1>

          <p className="text-lg text-white/65 leading-relaxed mb-10 max-w-lg">
            Paquetes exclusivos, hoteles premium y experiencias que recordarás para siempre.
          </p>

          {/* Search card */}
          <div className="w-full max-w-2xl rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex border-b border-white/10">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    tab === t ? 'text-white border-b-2 border-brand-rose bg-white/5' : 'text-white/40 hover:text-white/70'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-3 flex-1 rounded-xl bg-white/8 border border-white/10 focus-within:border-white/25 transition-colors px-4 py-3">
                <MapPin className="h-4 w-4 text-brand-rose flex-shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="¿A dónde quieres ir?"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none" />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/10 px-4 py-3 min-w-[130px]">
                <Users className="h-4 w-4 text-brand-rose flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors flex items-center justify-center leading-none">−</button>
                  <span className="text-sm text-white font-medium w-5 text-center">{travelers}</span>
                  <button onClick={() => setTravelers(Math.min(20, travelers + 1))}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors flex items-center justify-center leading-none">+</button>
                </div>
              </div>

              <button onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-brand-wine hover:bg-brand-wine/85 text-white px-6 py-3 font-bold rounded-xl transition-all text-sm whitespace-nowrap">
                <Search className="h-4 w-4" /> Buscar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-white/30 text-xs">Popular:</span>
            {['Machu Picchu', 'Cusco', 'Caribe', 'Europa'].map(dest => (
              <Link key={dest} href={`${ROUTES.packages}?search=${dest}`}
                className="text-xs text-white/50 hover:text-white transition-colors bg-white/8 hover:bg-white/15 border border-white/10 rounded-full px-3 py-1">
                {dest}
              </Link>
            ))}
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
          ))}
        </div>

        <div className="absolute bottom-10 right-8 z-10 hidden sm:block">
          <ChevronDown className="h-4 w-4 text-white/25 animate-bounce" />
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-brand-darkest border-t border-brand-steel/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-brand-steel/15">
            {[
              { value: '500+', label: 'Destinos' },
              { value: '10K+', label: 'Viajeros felices' },
              { value: '4.9★', label: 'Calificación' },
              { value: '15+',  label: 'Años de experiencia' },
            ].map(stat => (
              <div key={stat.label} className="py-6 px-6 text-center">
                <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-brand-silver/60 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
