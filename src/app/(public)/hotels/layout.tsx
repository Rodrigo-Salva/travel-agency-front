import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hoteles — TravelAgency',
  description: 'Encuentra los mejores hoteles en los destinos más populares. Desde boutiques íntimos hasta resorts de lujo, con los mejores precios garantizados.',
}

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return children
}
