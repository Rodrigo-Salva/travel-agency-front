import Link from 'next/link'
import { Plane, Mail, Phone, MapPin, Share2, MessageCircle, Globe } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

const FOOTER_LINKS = {
  explorar: [
    { label: 'Destinos',    href: ROUTES.destinations },
    { label: 'Paquetes',    href: ROUTES.packages },
    { label: 'Hoteles',     href: ROUTES.hotels },
    { label: 'Actividades', href: ROUTES.activities },
  ],
  servicios: [
    { label: 'Mis Reservas',    href: ROUTES.customer.bookings },
    { label: 'Lista de Deseos', href: ROUTES.customer.wishlist },
    { label: 'Contacto',        href: ROUTES.contact },
  ],
}

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-darkest border-t border-brand-steel/15 relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={ROUTES.home} className="inline-flex items-center gap-3 mb-6 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-wine/15 border border-brand-wine/25 group-hover:bg-brand-wine/25 transition-all glow-wine-sm">
                <Plane className="h-4 w-4 text-brand-rose rotate-45" />
              </div>
              <span className="font-display text-xl font-bold">
                <span className="text-white">Travel</span>
                <span className="text-gradient-brand">Agency</span>
              </span>
            </Link>
            <p className="text-sm text-brand-silver/60 leading-relaxed mb-6">
              Creamos experiencias de viaje únicas e inolvidables. Tu aventura comienza aquí.
            </p>
            <div className="flex items-center gap-2">
              {[Share2, MessageCircle, Globe].map((Icon, i) => (
                <a key={i} href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-steel border border-brand-steel/20 hover:text-brand-rose hover:border-brand-wine/40 transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-[11px] font-bold text-brand-rose uppercase tracking-[0.2em] mb-6">Explorar</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.explorar.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-silver/60 hover:text-brand-rose transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-wine/60" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-[11px] font-bold text-brand-rose uppercase tracking-[0.2em] mb-6">Servicios</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.servicios.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-silver/60 hover:text-brand-rose transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-wine/60" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-[11px] font-bold text-brand-rose uppercase tracking-[0.2em] mb-6">Contacto</h3>
            <ul className="space-y-4">
              {[
                { Icon: MapPin, text: 'Lima, Perú' },
                { Icon: Phone,  text: '+51 999 999 999' },
                { Icon: Mail,   text: 'info@travelagency.com' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-brand-silver/60">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-wine/8 border border-brand-wine/15">
                    <Icon className="h-3.5 w-3.5 text-brand-rose" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-brand-steel/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-steel/50">
            © {new Date().getFullYear()} TravelAgency. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            {['Privacidad', 'Términos', 'Cookies'].map(t => (
              <Link key={t} href="#" className="text-xs text-brand-steel/50 hover:text-brand-rose transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
