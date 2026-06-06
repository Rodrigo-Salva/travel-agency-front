'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { HeroSearch } from '@/components/home/HeroSearch'
import { ROUTES } from '@/lib/constants/routes'

const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80', tag: 'Naturaleza', title: 'Descubre el mundo', sub: 'con nosotros' },
  { img: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80', tag: 'Aventura',   title: 'Vive experiencias', sub: 'únicas' },
  { img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80', tag: 'Cultura',    title: 'Explora culturas',  sub: 'del mundo' },
]

export function HeroSection() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

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
          <HeroSearch />

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

    </>
  )
}
