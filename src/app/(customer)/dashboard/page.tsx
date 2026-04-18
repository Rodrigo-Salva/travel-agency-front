import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Cuenta',
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Mi Cuenta</h1>
      <p className="text-brand-silver">Panel del cliente — Fase 3</p>
    </div>
  )
}
