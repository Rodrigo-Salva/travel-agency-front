import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchDestination(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}destinations/${id}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.destino ?? data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const dest = await fetchDestination(id)

  if (!dest) {
    return {
      title: 'Destino no encontrado',
      description: 'El destino solicitado no existe.',
    }
  }

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const rawImage = dest.image
  const imageUrl = rawImage
    ? rawImage.startsWith('http') ? rawImage : `${BASE}${rawImage}`
    : undefined

  const title = `${dest.name}${dest.country ? `, ${dest.country}` : ''} — TravelAgency`
  const description = (dest.description ?? dest.short_description ?? '')
    .slice(0, 160) || `Descubre ${dest.name}${dest.country ? ` en ${dest.country}` : ''}. Paquetes, hoteles y actividades.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: dest.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default function DestinationDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
