import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchHotel(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}hotels/${id}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.hotel ?? data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const hotel = await fetchHotel(id)

  if (!hotel) {
    return {
      title: 'Hotel no encontrado',
      description: 'El hotel solicitado no existe.',
    }
  }

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const rawImage = hotel.image ?? hotel.main_image
  const imageUrl = rawImage
    ? rawImage.startsWith('http') ? rawImage : `${BASE}${rawImage}`
    : undefined

  const stars = hotel.star_rating ? ` ${'★'.repeat(Number(hotel.star_rating))}` : ''
  const title = `${hotel.name}${stars} — TravelAgency`
  const description = (hotel.description ?? '')
    .slice(0, 160) || `Hotel${stars} en ${hotel.address ?? 'destino selecto'}. Desde $${hotel.price_per_night} por noche.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: hotel.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default function HotelDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
