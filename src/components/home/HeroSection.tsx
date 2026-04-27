'use client'

import Link from 'next/link'
import { Search, MapPin, Calendar, Users, ArrowRight, Star } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <>
    <section className="relative min-h-[75vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-wine/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-steel/10 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(103,126,138,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(103,126,138,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-wine/40 bg-brand-wine/10 px-4 py-1.5 text-sm text-brand-rose mb-6">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Agencia de viajes #1 en Peru</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Descubre el{' '}
            <span className="text-gradient-brand">mundo</span>
            <br />
            con nosotros
          </h1>

          <p className="text-base text-brand-silver leading-relaxed mb-7 max-w-2xl">
            Experiencias de viaje exclusivas, paquetes personalizados y destinos increibles.
            Tu aventura perfecta comienza aqui.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              href={ROUTES.packages}
              className={cn(
                'inline-flex items-center gap-2 bg-brand-wine hover:bg-brand-wine/90 text-white px-8 h-12 rounded-lg text-base font-semibold glow-wine transition-colors'
              )}
            >
              Ver Paquetes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.destinations}
              className="inline-flex items-center justify-center border border-brand-steel/40 text-brand-silver hover:text-white hover:bg-brand-dark px-8 h-12 rounded-lg text-base font-semibold transition-colors"
            >
              Explorar Destinos
            </Link>
          </div>

          {/* Quick search bar */}
          <div className="rounded-2xl border border-brand-steel/20 bg-brand-dark/80 backdrop-blur-sm p-4 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-brand-darkest/60 px-4 py-3 border border-brand-steel/10">
                <MapPin className="h-5 w-5 text-brand-wine shrink-0" />
                <div>
                  <p className="text-xs text-brand-steel font-medium uppercase tracking-wide">Destino</p>
                  <p className="text-sm text-brand-silver">¿A donde quieres ir?</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-brand-darkest/60 px-4 py-3 border border-brand-steel/10">
                <Calendar className="h-5 w-5 text-brand-wine shrink-0" />
                <div>
                  <p className="text-xs text-brand-steel font-medium uppercase tracking-wide">Fechas</p>
                  <p className="text-sm text-brand-silver">Seleccionar fechas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-brand-darkest/60 px-4 py-3 border border-brand-steel/10 sm:col-auto">
                <Users className="h-5 w-5 text-brand-wine shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-brand-steel font-medium uppercase tracking-wide">Viajeros</p>
                  <p className="text-sm text-brand-silver">2 adultos</p>
                </div>
              </div>
            </div>
            <Link
              href={ROUTES.packages}
              className="flex items-center justify-center w-full mt-3 bg-brand-wine hover:bg-brand-wine/90 text-white h-11 font-semibold rounded-lg transition-colors gap-2"
            >
              <Search className="h-4 w-4" />
              Buscar Paquetes
            </Link>
          </div>
        </div>
      </div>

    </section>

    {/* Stats row */}
    <div className="border-t border-brand-steel/10 bg-brand-darkest">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 divide-x divide-brand-steel/10">
          {[
            { value: '500+', label: 'Destinos' },
            { value: '10K+', label: 'Viajeros felices' },
            { value: '4.9★', label: 'Calificacion promedio' },
          ].map((stat) => (
            <div key={stat.label} className="py-4 px-6 text-center">
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
