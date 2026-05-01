import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Cuenta — TravelAgency',
  description: 'Gestiona tus reservas, lista de deseos, reseñas y perfil personal.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
