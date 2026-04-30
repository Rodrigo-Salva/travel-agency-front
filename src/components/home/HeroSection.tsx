'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Users, ArrowRight, Star, Plane } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
]

export function HeroSection() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [imgIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length))

  function handleSearch() {
    const params = new URLSearchParams()
    if (destination.trim()) params.set('search', destination.trim())
    if (travelers !== 2) params.set('adults', String(travelers))
    router.push(`${ROUTES.packages}?${params.toString()}`)
  }

  return (
    <>
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src={HERO_IMAGES[imgIdx]}
        alt="Destinos de viaje"
        fill
        priority
        className="object-cover object-center scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
        sizes="100vw"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-darkest/95 via-brand-darkest/70 to-brand-darkest/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-transparent to-transparent" />

      {/* Animated accent blobs */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-wine/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-brand-rose/10 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Floating badge top-right */}
      <div className="absolute top-24 right-8 hidden lg:flex flex-col items-center gap-1 bg-brand-dark/80 backdrop-blur-sm border border-brand-wine/20 rounded-2xl px-5 py-4 animate-[float_6s_ease-in-out_infinite]">
        <Plane className="h-6 w-6 text-brand-wine" />
        <p className="text-white font-bold text-lg leading-none">500+</p>
        <p className="text-brand-steel text-xs">Destinos</p>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-wine/40 bg-brand-wine/10 backdrop-blur-sm px-4 py-1.5 text-sm text-brand-rose mb-6">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Agencia de viajes #1 en Peru</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5">
            Descubre el{' '}
            <span className="text-gradient-brand">mundo</span>
            <br />
            con nosotros
          </h1>

          <p className="text-lg text-brand-silver/90 leading-relaxed mb-8 max-w-xl">
            Experiencias de viaje exclusivas, paquetes personalizados y destinos increibles.
            Tu aventura perfecta comienza aqui.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              href={ROUTES.packages}
              className={cn('inline-flex items-center gap-2 bg-brand-wine hover:bg-brand-wine/90 text-white px-8 h-12 rounded-xl text-base font-semibold glow-wine transition-all hover:scale-105')}
            >
              Ver Paquetes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.destinations}
              className="inline-flex items-center justify-center border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 h-12 rounded-xl text-base font-semibold transition-all hover:scale-105"
            >
              Explorar Destinos
            </Link>
          </div>

          {/* Search bar */}
          <div className="rounded-2xl border border-white/10 bg-brand-dark/70 backdrop-blur-md p-4 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-brand-darkest/60 px-4 py-2 border border-brand-steel/10 focus-within:border-brand-wine/40 transition-colors">
                <MapPin className="h-5 w-5 text-brand-wine shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-steel font-medium uppercase tracking-wide">Destino</p>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="¿A donde quieres ir?"
                    className="w-full bg-transparent text-sm text-white placeholder:text-brand-steel/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-brand-darkest/60 px-4 py-2 border border-brand-steel/10 sm:col-span-2">
                <Users className="h-5 w-5 text-brand-wine shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-brand-steel font-medium uppercase tracking-wide">Viajeros</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-6 h-6 rounded-full bg-brand-steel/20 hover:bg-brand-wine/40 text-white text-sm font-bold transition-colors flex items-center justify-center"
                    >−</button>
                    <span className="text-sm text-white font-medium w-16 text-center">
                      {travelers} adulto{travelers !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setTravelers(Math.min(20, travelers + 1))}
                      className="w-6 h-6 rounded-full bg-brand-steel/20 hover:bg-brand-wine/40 text-white text-sm font-bold transition-colors flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center w-full mt-3 bg-brand-wine hover:bg-brand-wine/90 text-white h-11 font-semibold rounded-xl transition-all hover:scale-[1.01] gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar Paquetes
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Stats row */}
    <div className="border-t border-brand-steel/10 bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 divide-x divide-brand-steel/10">
          {[
            { value: '500+', label: 'Destinos' },
            { value: '10K+', label: 'Viajeros felices' },
            { value: '4.9★', label: 'Calificacion promedio' },
          ].map((stat) => (
            <div key={stat.label} className="py-5 px-6 text-center">
              <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-brand-steel mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
