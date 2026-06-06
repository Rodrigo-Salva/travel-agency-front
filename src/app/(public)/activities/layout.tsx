import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Actividades — TravelAgency',
  description: 'Vive experiencias únicas: aventura, cultura, gastronomía y más. Actividades para todos los gustos y niveles de dificultad en destinos de todo el mundo.',
}

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
