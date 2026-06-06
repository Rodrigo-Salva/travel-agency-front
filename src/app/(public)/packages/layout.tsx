import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paquetes de Viaje — TravelAgency',
  description: 'Explora nuestros paquetes de viaje exclusivos. Destinos nacionales e internacionales con todo incluido, guías expertos y las mejores experiencias.',
}

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
