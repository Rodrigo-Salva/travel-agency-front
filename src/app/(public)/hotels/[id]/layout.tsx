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

  const stars = hotel.star_rating ? ` ${'★'.repeat(hotel.star_rating)}` : ''
  const title = `${hotel.name}${stars} — TravelAgency`
  const description = hotel.description
    ? hotel.description.slice(0, 160)
    : `Hotel${stars} en ${hotel.destination_name ?? 'destino selecto'}. Desde USD ${hotel.price_per_night} por noche.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(hotel.main_image ? { images: [{ url: hotel.main_image }] } : {}),
    },
  }
}

export default function HotelDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
