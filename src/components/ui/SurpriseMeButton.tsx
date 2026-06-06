'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shuffle, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { ROUTES } from '@/lib/constants/routes'
import { toast } from 'sonner'

type Mode = 'package' | 'destination'

interface Props {
  mode?: Mode
  className?: string
  label?: string
}

export function SurpriseMeButton({ mode = 'package', className = '', label }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSurprise() {
    setLoading(true)
    try {
      if (mode === 'package') {
        const { data } = await apiClient.get(API.packages, {
          params: { is_active: true, page_size: 50 },
        })
        const packages = data?.results?.paquetes ?? data?.paquetes ?? []
        if (!packages.length) { toast.error('No hay paquetes disponibles'); return }
        const random = packages[Math.floor(Math.random() * packages.length)]
        router.push(ROUTES.package(random.id))
      } else {
        const { data } = await apiClient.get(API.destinations, {
          params: { page_size: 50 },
        })
        const destinations = data?.results?.destinos ?? data?.destinos ?? []
        if (!destinations.length) { toast.error('No hay destinos disponibles'); return }
        const random = destinations[Math.floor(Math.random() * destinations.length)]
        router.push(ROUTES.destination(random.id))
      }
    } catch {
      toast.error('No se pudo cargar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const defaultLabel = mode === 'package' ? '¡Sorpréndeme!' : 'Destino aleatorio'

  return (
    <button
      onClick={handleSurprise}
      disabled={loading}
      className={`group inline-flex items-center gap-2 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
        : <Shuffle className="h-4 w-4 flex-shrink-0 group-hover:rotate-180 transition-transform duration-500" />
      }
      {label ?? defaultLabel}
    </button>
  )
}
