import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedDestinations } from '@/features/destinations/components/FeaturedDestinations'
import { FeaturedPackages } from '@/features/packages/components/FeaturedPackages'

export const metadata = {
  title: 'TravelAgency — Experiencias Unicas',
  description:
    'Descubre los mejores destinos. Paquetes exclusivos, hoteles de lujo y experiencias inolvidables.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedDestinations />
        <FeaturedPackages />

        {/* CTA Section */}
        <section className="py-20 bg-brand-dark border-t border-brand-steel/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              ¿Listo para tu proxima aventura?
            </h2>
            <p className="text-brand-silver text-lg mb-8 max-w-xl mx-auto">
              Contactanos y diseñamos el viaje de tus sueños a medida.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold transition-colors"
              >
                Consultar ahora
              </a>
              <a
                href="/packages"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-brand-steel/40 text-brand-silver hover:text-white hover:bg-brand-darkest/50 font-semibold transition-colors"
              >
                Ver todos los paquetes
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
