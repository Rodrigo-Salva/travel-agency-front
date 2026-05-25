import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

async function fetchFlight(id: string) {
  try {
    const res = await fetch(`${API_BASE}flights/${id}/`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const flight = await fetchFlight(id)

  if (!flight) return { title: 'Vuelo no encontrado' }

  const title = `${flight.airline_name} ${flight.flight_number} — ${flight.origin_city} → ${flight.destination_city}`
  const description = `Vuelo ${flight.flight_class ?? ''} de ${flight.origin_city} (${flight.origin_airport}) a ${flight.destination_city} (${flight.destination_airport}). ${flight.duration ?? ''}. Desde $${flight.price} por persona.`.trim()

  return {
    title,
    description,
    openGraph: {
      title: `${title} | TravelAgency`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default function FlightDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
