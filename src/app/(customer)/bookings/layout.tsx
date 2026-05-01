import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Reservas — TravelAgency',
  description: 'Consulta y gestiona todas tus reservas de viaje.',
}

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
