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

  const title = `${activity.name} — TravelAgency`
  const description = activity.description
    ? activity.description.slice(0, 160)
    : `${activity.name} en ${activity.destination_name ?? 'destino increíble'}. Duración: ${activity.duration_hours ?? '?'} horas. Desde USD ${activity.price_per_person}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(activity.main_image ? { images: [{ url: activity.main_image }] } : {}),
    },
  }
}

export default function ActivityDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
