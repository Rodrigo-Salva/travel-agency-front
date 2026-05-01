import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[80vh] bg-brand-darkest flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          {/* Big 404 */}
          <div className="relative mb-8 select-none">
            <p className="font-display text-[10rem] sm:text-[14rem] font-bold leading-none text-brand-steel/10">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">✈️</div>
                <p className="font-display text-2xl font-bold text-white">Página no encontrada</p>
              </div>
            </div>
          </div>

          <p className="text-brand-silver text-lg max-w-md mx-auto mb-10">
            Parece que esta página despegó sin dejar rastro.
            Vuelve al inicio o explora nuestros destinos.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={ROUTES.home}
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold transition-colors"
            >
              Ir al inicio
            </Link>
            <Link
              href={ROUTES.packages}
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-brand-steel/40 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold transition-colors"
            >
              Ver paquetes
            </Link>
            <Link
              href={ROUTES.destinations}
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-brand-steel/40 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold transition-colors"
            >
              Explorar destinos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
