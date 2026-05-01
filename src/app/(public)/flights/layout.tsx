import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vuelos — TravelAgency',
  description: 'Encuentra los mejores vuelos a precios increíbles. Vuelos directos e internacionales con las principales aerolíneas del mundo.',
}

export default function FlightsLayout({ children }: { children: React.ReactNode }) {
  return children
}
