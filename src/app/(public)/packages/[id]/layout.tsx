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

  const title = `${pkg.name} — TravelAgency`
  const description = pkg.description
    ? pkg.description.slice(0, 160)
    : `Paquete de ${pkg.duration_days} días a ${pkg.destination_name ?? 'destino increíble'}. Desde USD ${pkg.base_price}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(pkg.main_image ? { images: [{ url: pkg.main_image }] } : {}),
    },
  }
}

export default function PackageDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
