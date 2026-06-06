'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ROUTES } from '@/lib/constants/routes'
import { Home, Package, MapPin, Search, ArrowRight } from 'lucide-react'

const CLOUDS = [
  { size: 'w-28 h-10', top: '18%', left: '8%',  delay: '0s',    duration: '18s', opacity: 'opacity-10' },
  { size: 'w-20 h-8',  top: '35%', left: '80%', delay: '3s',    duration: '22s', opacity: 'opacity-8'  },
  { size: 'w-36 h-12', top: '60%', left: '15%', delay: '6s',    duration: '26s', opacity: 'opacity-6'  },
  { size: 'w-16 h-6',  top: '75%', left: '65%', delay: '1.5s',  duration: '20s', opacity: 'opacity-10' },
]

function Cloud({ size, top, left, delay, duration, opacity }: typeof CLOUDS[0]) {
  return (
    <div
      className={`absolute ${size} ${opacity} rounded-full bg-brand-steel`}
      style={{
        top, left,
        animation: `driftRight ${duration} linear ${delay} infinite`,
        filter: 'blur(8px)',
      }}
    />
  )
}

export default function NotFound() {
  const [planeX, setPlaneX] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let frame: number
    let start: number | null = null
    const DURATION = 8000

    function animate(ts: number) {
      if (!start) start = ts
      const progress = ((ts - start) % DURATION) / DURATION
      // Ease in-out sine for smooth loop
      const x = Math.sin(progress * Math.PI * 2) * 30
      setPlaneX(x)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <style>{`
        @keyframes driftRight {
          from { transform: translateX(-120px); }
          to   { transform: translateX(calc(100vw + 120px)); }
        }
        @keyframes planeBob {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes trailFade {
          0%   { opacity: 0.4; width: 80px; }
          100% { opacity: 0; width: 0px; }
        }
      `}</style>

      <Navbar />
      <main className="flex-1 min-h-[85vh] bg-brand-darkest flex items-center justify-center relative overflow-hidden">

        {/* Clouds */}
        {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(98,35,71,0.08) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4 text-center relative z-10">

          {/* 404 number */}
          <div className="relative mb-4 select-none">
            <p className="font-display font-bold leading-none text-brand-steel/8"
              style={{ fontSize: 'clamp(8rem, 20vw, 18rem)' }}>
              404
            </p>

            {/* Animated plane */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `translateX(${mounted ? planeX : 0}px)` }}
            >
              <div style={{ animation: 'planeBob 4s ease-in-out infinite' }}>
                <svg viewBox="0 0 64 64" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-2xl" fill="none">
                  {/* Plane body */}
                  <path d="M8 32 L52 18 L56 32 L52 46 Z" fill="#622347" opacity="0.9" />
                  {/* Wing */}
                  <path d="M28 32 L44 20 L48 32 L44 44 Z" fill="#E0B4B2" opacity="0.8" />
                  {/* Tail */}
                  <path d="M10 32 L18 24 L20 32 L18 40 Z" fill="#E0B4B2" opacity="0.7" />
                  {/* Window */}
                  <circle cx="42" cy="30" r="3" fill="white" opacity="0.9" />
                  <circle cx="42" cy="30" r="1.5" fill="#622347" />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
            Esta página despegó sin avisar
          </h1>
          <p className="text-brand-silver/70 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Parece que la ruta que buscas no existe o fue redirigida.
            Pero no te preocupes, hay muchos destinos por explorar.
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link href={ROUTES.home}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold text-sm transition-all glow-wine-sm">
              <Home className="h-4 w-4" /> Ir al inicio
            </Link>
            <Link href={ROUTES.packages}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-brand-steel/30 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold text-sm transition-all">
              <Package className="h-4 w-4" /> Ver paquetes
            </Link>
            <Link href={ROUTES.destinations}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-brand-steel/30 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold text-sm transition-all">
              <MapPin className="h-4 w-4" /> Destinos
            </Link>
          </div>

          {/* Popular links */}
          <div className="max-w-sm mx-auto">
            <p className="text-xs text-brand-steel uppercase tracking-widest mb-4">Páginas populares</p>
            <div className="space-y-2">
              {[
                { label: 'Machu Picchu', href: `${ROUTES.packages}?search=Machu+Picchu` },
                { label: 'Paquetes todo incluido', href: `${ROUTES.packages}?search=todo+incluido` },
                { label: 'Quiénes somos', href: ROUTES.about },
                { label: 'Contacto', href: ROUTES.contact },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-steel/10 text-brand-silver/70 hover:text-white hover:border-brand-wine/30 transition-all text-sm group">
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-brand-steel" />
                    {label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-steel group-hover:text-brand-wine transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
