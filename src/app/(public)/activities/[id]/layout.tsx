import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchActivity(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}activities/${id}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.actividad ?? data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const activity = await fetchActivity(id)

  if (!activity) {
    return {
      title: 'Actividad no encontrada',
      description: 'La actividad solicitada no existe.',
    }
  }

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const rawImage = activity.image ?? activity.main_image
  const imageUrl = rawImage
    ? rawImage.startsWith('http') ? rawImage : `${BASE}${rawImage}`
    : undefined

  const title = `${activity.name} — TravelAgency`
  const description = (activity.description ?? '')
    .slice(0, 160) || `${activity.name}. Duración: ${activity.duration_hours ?? '?'} horas. Desde $${activity.price_per_person} por persona.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: activity.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default function ActivityDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
