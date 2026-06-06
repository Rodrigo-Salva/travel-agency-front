import type { Metadata } from 'next'
import PackageDetailClient from './PackageDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/').replace(/\/$/, '')
const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const res = await fetch(`${API_BASE}/packages/${id}/`, {
      next: { revalidate: 60 * 10 }, // cache 10 min
    })

    if (!res.ok) throw new Error('not found')

    const data = await res.json()
    const pkg = data.paquete

    const title = `${pkg.name} — TravelAgency`
    const description = pkg.short_description ?? pkg.description?.slice(0, 160) ?? ''
    const imageUrl = pkg.image
      ? pkg.image.startsWith('http')
        ? pkg.image
        : `${API_BASE.replace('/api', '')}${pkg.image}`
      : null

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${SITE_BASE}/packages/${id}`,
        ...(imageUrl && {
          images: [{ url: imageUrl, width: 1200, height: 630, alt: pkg.name }],
        }),
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      alternates: {
        canonical: `${SITE_BASE}/packages/${id}`,
      },
    }
  } catch {
    return {
      title: 'Paquete de viaje — TravelAgency',
      description: 'Descubre nuestros increíbles paquetes de viaje.',
    }
  }
}

export default function PackageDetailPage({ params }: Props) {
  return <PackageDetailClient params={params} />
}
