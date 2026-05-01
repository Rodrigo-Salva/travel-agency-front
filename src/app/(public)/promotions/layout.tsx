import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Promociones y Cupones — TravelAgency',
  description: 'Aprovecha nuestros descuentos y cupones exclusivos. Ahorra en tus próximas reservas con las mejores ofertas de viaje.',
}

export default function PromotionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
