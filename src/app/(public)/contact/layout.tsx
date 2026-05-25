import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto — TravelAgency',
  description: 'Contáctanos para diseñar tu viaje soñado. Nuestros expertos están disponibles para ayudarte con cualquier consulta o reserva personalizada.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
