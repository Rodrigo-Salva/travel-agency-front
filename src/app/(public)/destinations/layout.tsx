import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Destinos — TravelAgency',
  description: 'Descubre más de 500 destinos increíbles alrededor del mundo. Playas, montañas, ciudades históricas y maravillas naturales te esperan.',
}

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
