import type { Metadata } from 'next'
import DestinationDetailClient from './DestinationDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/').replace(/\/$/, '')
const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const res = await fetch(`${API_BASE}/destinations/${id}/`, {
      next: { revalidate: 60 * 10 },
    })

    if (!res.ok) throw new Error('not found')

    const data = await res.json()
    const dest = data.destino ?? data

    const title = `${dest.name}${dest.country ? `, ${dest.country}` : ''} — TravelAgency`
    const description = dest.description?.slice(0, 160) ?? `Viaja a ${dest.name} con TravelAgency`
    const imageUrl = dest.image
      ? dest.image.startsWith('http')
        ? dest.image
        : `${API_BASE.replace('/api', '')}${dest.image}`
      : null

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${SITE_BASE}/destinations/${id}`,
        ...(imageUrl && {
          images: [{ url: imageUrl, width: 1200, height: 630, alt: dest.name }],
        }),
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      alternates: {
        canonical: `${SITE_BASE}/destinations/${id}`,
      },
    }
  } catch {
    return {
      title: 'Destino de viaje — TravelAgency',
      description: 'Explora los mejores destinos turísticos del mundo.',
    }
  }
}

export default function DestinationDetailPage({ params }: Props) {
  return <DestinationDetailClient params={params} />
}
