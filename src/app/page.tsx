import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsCounter } from '@/components/home/StatsCounter'
import { FeaturedDestinations } from '@/features/destinations/components/FeaturedDestinations'
import { FeaturedPackages } from '@/features/packages/components/FeaturedPackages'
import { FeaturedHotels } from '@/components/home/FeaturedHotels'
import { FeaturedActivities } from '@/components/home/FeaturedActivities'
import { WhyUs } from '@/components/home/WhyUs'
import { Testimonials } from '@/components/home/Testimonials'
import { Newsletter } from '@/components/home/Newsletter'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { ROUTES } from '@/lib/constants/routes'

export const metadata = {
  title: 'TravelAgency — Experiencias Unicas de Viaje en Peru',
  description:
    'Descubre los mejores destinos del mundo. Paquetes exclusivos, hoteles de lujo, actividades únicas y experiencias inolvidables con la agencia #1 en Peru.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsCounter />
        <FeaturedDestinations />
        <FeaturedPackages />
        <FeaturedHotels />
        <FeaturedActivities />
        <WhyUs />
        <Testimonials />
        <Newsletter />

        {/* CTA final */}
        <section className="py-20 bg-brand-darkest border-t border-brand-steel/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-brand-rose text-xs font-bold uppercase tracking-widest mb-3">
              Empieza hoy
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              ¿Listo para tu proxima aventura?
            </h2>
            <p className="text-brand-silver text-lg mb-10 max-w-xl mx-auto">
              Contactanos y diseñamos el viaje de tus sueños a medida.
              Sin costo adicional de asesoría.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={ROUTES.contact}
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold transition-colors glow-wine"
              >
                Consultar ahora
              </Link>
              <Link
                href={ROUTES.packages}
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-brand-steel/40 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold transition-colors"
              >
                Ver todos los paquetes
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
