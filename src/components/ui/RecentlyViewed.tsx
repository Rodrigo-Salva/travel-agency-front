'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, X, Hotel, Package, Zap, MapPin, Plane } from 'lucide-react'
import { useRecentlyViewed, type RecentItem } from '@/hooks/useRecentlyViewed'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

function resolveImage(src?: string | null) {
  if (!src) return null
  return src.startsWith('http') ? src : `${BASE_URL}${src}`
}

const TYPE_ICON: Record<RecentItem['type'], React.ReactNode> = {
  package:     <Package className="h-3 w-3" />,
  hotel:       <Hotel className="h-3 w-3" />,
  activity:    <Zap className="h-3 w-3" />,
  destination: <MapPin className="h-3 w-3" />,
  flight:      <Plane className="h-3 w-3" />,
}

const TYPE_LABEL: Record<RecentItem['type'], string> = {
  package:     'Paquete',
  hotel:       'Hotel',
  activity:    'Actividad',
  destination: 'Destino',
  flight:      'Vuelo',
}

interface Props {
  exclude?: { id: number; type: RecentItem['type'] }
  className?: string
}

export function RecentlyViewed({ exclude, className = '' }: Props) {
  const { items, clear } = useRecentlyViewed()

  const visible = items.filter(
    (i) => !(exclude && i.id === exclude.id && i.type === exclude.type)
  )

  if (visible.length === 0) return null

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-wine" />
          Vistos recientemente
        </h2>
        <button
          onClick={clear}
          className="text-xs text-brand-steel hover:text-brand-silver transition-colors flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Limpiar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((item) => {
          const img = resolveImage(item.image)
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="group rounded-xl overflow-hidden bg-brand-dark border border-brand-steel/10 hover:border-brand-wine/30 transition-all hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              <div className="relative h-24 bg-brand-darkest">
                {img ? (
                  <Image
                    src={img}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-steel/30">
                    {TYPE_ICON[item.type]}
                  </div>
                )}
                {/* Type badge */}
                <span className="absolute top-2 left-2 flex items-center gap-1 bg-brand-darkest/80 backdrop-blur-sm text-brand-silver text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  {TYPE_ICON[item.type]}
                  {TYPE_LABEL[item.type]}
                </span>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-brand-rose transition-colors">
                  {item.name}
                </p>
                {item.subtitle && (
                  <p className="text-brand-steel text-[11px] mt-0.5 truncate">{item.subtitle}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
