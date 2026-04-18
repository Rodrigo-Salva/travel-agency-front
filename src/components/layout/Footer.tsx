import Link from 'next/link'
import { Plane, Mail, Phone, MapPin, Share2, MessageCircle, Globe } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const FOOTER_LINKS = {
  explorar: [
    { label: 'Destinos', href: ROUTES.destinations },
    { label: 'Paquetes', href: ROUTES.packages },
    { label: 'Hoteles', href: ROUTES.hotels },
    { label: 'Vuelos', href: ROUTES.flights },
    { label: 'Actividades', href: ROUTES.activities },
  ],
  servicios: [
    { label: 'Reservas', href: ROUTES.customer.bookings },
    { label: 'Promociones', href: ROUTES.promotions },
    { label: 'Lista de Deseos', href: ROUTES.customer.wishlist },
    { label: 'Contacto', href: ROUTES.contact },
  ],
}

export function Footer() {
  return (
    <footer className="bg-brand-darkest border-t border-brand-steel/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={ROUTES.home} className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-wine">
                <Plane className="h-5 w-5 text-white rotate-45" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Travel<span className="text-brand-rose">Agency</span>
              </span>
            </Link>
            <p className="text-sm text-brand-silver leading-relaxed mb-4">
              Creamos experiencias de viaje unicas e inolvidables. Tu aventura comienza aqui.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Redes sociales"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-steel/30 text-brand-silver hover:text-white hover:border-brand-wine transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Contacto"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-steel/30 text-brand-silver hover:text-white hover:border-brand-wine transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Web"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-steel/30 text-brand-silver hover:text-white hover:border-brand-wine transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explorar
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.explorar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-silver hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Servicios
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.servicios.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-silver hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-brand-silver">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-wine shrink-0" />
                <span>Lima, Peru</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-brand-silver">
                <Phone className="h-4 w-4 text-brand-wine shrink-0" />
                <span>+51 999 999 999</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-brand-silver">
                <Mail className="h-4 w-4 text-brand-wine shrink-0" />
                <span>info@travelagency.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-steel/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-steel">
            © {new Date().getFullYear()} TravelAgency. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-brand-steel hover:text-brand-silver transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="text-xs text-brand-steel hover:text-brand-silver transition-colors">
              Terminos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
