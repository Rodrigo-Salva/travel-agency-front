import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchPackage(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}packages/${id}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.paquete ?? data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const pkg = await fetchPackage(id)

  if (!pkg) {
    return {
      title: 'Paquete no encontrado',
      description: 'El paquete solicitado no existe.',
    }
  }

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const rawImage = pkg.image ?? pkg.main_image
  const imageUrl = rawImage
    ? rawImage.startsWith('http') ? rawImage : `${BASE}${rawImage}`
    : undefined

  const title = `${pkg.name} — TravelAgency`
  const description = (pkg.short_description ?? pkg.description ?? '')
    .slice(0, 160) || `Paquete de ${pkg.duration_days ?? '?'} días. Precio desde ${pkg.price_adult ?? pkg.base_price ?? ''}`.trim()

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: pkg.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}

export default function PackageDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
