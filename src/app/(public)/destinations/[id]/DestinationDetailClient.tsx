'use client'

import { use, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Globe, Calendar, Package, Share2, Check, Camera, Utensils, Waves, Mountain, TreePalm, Landmark, Music, ShoppingBag, Hotel, Zap } from 'lucide-react'
import { useDestination } from '@/features/destinations/hooks/useDestinations'
import { usePackages } from '@/features/packages/hooks/usePackages'
import { useHotels } from '@/features/hotels/hooks/useHotels'
import { useActivities } from '@/features/activities/hooks/useActivities'
import { PackageCard, PackageCardSkeleton } from '@/features/packages/components/PackageCard'
import { HotelCard } from '@/features/hotels/components/HotelCard'
import { ActivityCard } from '@/features/activities/components/ActivityCard'
import { RecentlyViewed } from '@/components/ui/RecentlyViewed'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { ROUTES } from '@/lib/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

const DestinationMap = dynamic(
  () => import('@/features/destinations/components/DestinationMap').then((m) => m.DestinationMap),
  { ssr: false, loading: () => <div className="h-[300px] rounded-2xl bg-brand-dark animate-pulse" /> },
)

interface Props {
  params: Promise<{ id: string }>
}

// Highlights por continente / tipo de destino
const HIGHLIGHTS_BY_CONTINENT: Record<string, { icon: typeof Camera; title: string; desc: string }[]> = {
  'América del Sur': [
    { icon: Mountain,  title: 'Trekking y aventura', desc: 'Rutas espectaculares entre montañas y selva.' },
    { icon: Landmark,  title: 'Historia y cultura',  desc: 'Sitios arqueológicos y patrimonio prehispánico.' },
    { icon: Utensils,  title: 'Gastronomía local',   desc: 'Sabores únicos reconocidos a nivel mundial.' },
    { icon: Camera,    title: 'Fotografía',           desc: 'Paisajes únicos en cada rincón.' },
  ],
  'Europa': [
    { icon: Landmark,   title: 'Arte y arquitectura',  desc: 'Museos, catedrales y ciudades históricas.' },
    { icon: Utensils,   title: 'Gastronomía',          desc: 'Cocinas regionales de clase mundial.' },
    { icon: ShoppingBag,title: 'Compras y moda',       desc: 'Las mejores marcas y mercados artesanales.' },
    { icon: Music,      title: 'Vida nocturna',        desc: 'Conciertos, óperas y espectáculos únicos.' },
  ],
  'Asia': [
    { icon: Landmark,  title: 'Templos y espiritualidad', desc: 'Santuarios ancestrales y tradiciones milenarias.' },
    { icon: Utensils,  title: 'Gastronomía exótica',       desc: 'Sabores que no encontrarás en ningún otro lugar.' },
    { icon: Mountain,  title: 'Paisajes naturales',        desc: 'Desde desiertos hasta archipiélagos tropicales.' },
    { icon: ShoppingBag, title: 'Mercados locales',       desc: 'Artesanías, especias y productos únicos.' },
  ],
  'África': [
    { icon: Camera,    title: 'Safari y fauna',     desc: 'Los cinco grandes en su hábitat natural.' },
    { icon: Waves,     title: 'Playas vírgenes',    desc: 'Costas del Índico y el Atlántico.' },
    { icon: Landmark,  title: 'Culturas milenarias', desc: 'Tribus y tradiciones de miles de años.' },
    { icon: Mountain,  title: 'Parques naturales',  desc: 'Reservas y ecosistemas únicos.' },
  ],
  'default': [
    { icon: Camera,    title: 'Fotografía y paisajes', desc: 'Escenarios que quitarán el aliento.' },
    { icon: Utensils,  title: 'Gastronomía',           desc: 'Deléitate con la cocina local.' },
    { icon: TreePalm,  title: 'Naturaleza',            desc: 'Playas, selvas y ecosistemas únicos.' },
    { icon: Landmark,  title: 'Cultura e historia',    desc: 'Conoce el alma del destino.' },
  ],
}

type Tab = 'descripcion' | 'paquetes' | 'hoteles' | 'actividades'

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: 'descripcion',  label: 'Descripción',  icon: Landmark },
  { key: 'paquetes',     label: 'Paquetes',      icon: Package },
  { key: 'hoteles',      label: 'Hoteles',       icon: Hotel },
  { key: 'actividades',  label: 'Actividades',   icon: Zap },
]

export default function DestinationDetailClient({ params }: Props) {
  const { id } = use(params)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('descripcion')
  const { data: destination, isLoading, isError } = useDestination(id)
  const { add: trackView } = useRecentlyViewed()
  const BASE_URL_TRACK = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

  useEffect(() => {
    if (!destination) return
    const rawImg = destination.image
    const img = rawImg
      ? rawImg.startsWith('http') ? rawImg : `${BASE_URL_TRACK}${rawImg}`
      : null
    trackView({
      id: destination.id,
      type: 'destination',
      name: destination.name,
      image: img,
      subtitle: destination.country,
      href: ROUTES.destination(destination.id),
    })
  }, [destination?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: destination?.name ?? 'Destino', url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const destId = destination?.id
  const { data: packagesData, isLoading: packagesLoading } = usePackages(
    destId ? { destination: destId, page_size: 6 } : { page_size: 6 },
  )
  const { data: hotelsData, isLoading: hotelsLoading } = useHotels(
    destId ? { destination: destId, page_size: 8 } : { page_size: 0 },
  )
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(
    destId ? { destination: destId, page_size: 8 } : { page_size: 0 },
  )

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = destination?.image
    ? destination.image.startsWith('http')
      ? destination.image
      : `${BASE_URL}${destination.image}`
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest animate-pulse">
        <div className="h-80 bg-brand-dark" />
        <div className="container mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-64 bg-brand-steel/20 rounded" />
          <div className="h-4 w-full max-w-2xl bg-brand-steel/10 rounded" />
          <div className="h-4 w-3/4 bg-brand-steel/10 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !destination) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <MapPin className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Destino no encontrado</h2>
        <p className="text-brand-silver">El destino que buscas no existe o fue eliminado.</p>
        <Link
          href={ROUTES.destinations}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a destinos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero image */}
      <div className="relative h-[420px] bg-brand-dark overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={destination.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark to-brand-darkest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-brand-darkest/40 to-transparent" />

        {/* Back button + share */}
        <div className="absolute top-6 left-0 right-0 container mx-auto px-4 flex items-center justify-between">
          <Link
            href={ROUTES.destinations}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors bg-brand-darkest/60 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Todos los destinos
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors bg-brand-darkest/60 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            {copied ? <><Check className="h-4 w-4 text-emerald-400" /> ¡Copiado!</> : <><Share2 className="h-4 w-4" /> Compartir</>}
          </button>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            {destination.is_popular && (
              <Badge className="bg-brand-wine/90 border-0 text-white flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Popular
              </Badge>
            )}
            <Badge variant="secondary" className="bg-brand-darkest/80 border-brand-steel/20 text-brand-silver">
              {destination.continent}
            </Badge>
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">{destination.name}</h1>
          <div className="flex items-center gap-2 text-brand-rose text-sm font-medium">
            <MapPin className="h-4 w-4" />
            {destination.country}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Destinos', href: ROUTES.destinations }, { label: destination.name }]} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === key
                      ? 'bg-brand-wine text-white shadow-sm'
                      : 'text-brand-silver hover:text-white hover:bg-brand-steel/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Descripción */}
            {activeTab === 'descripcion' && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white mb-4">Sobre este destino</h2>
                  <p className="text-brand-silver leading-relaxed text-base">
                    {destination.description || destination.short_description}
                  </p>
                </div>

                {/* Qué hacer aquí */}
                {(() => {
                  const highlights = HIGHLIGHTS_BY_CONTINENT[destination.continent] ?? HIGHLIGHTS_BY_CONTINENT['default']
                  return (
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white mb-4">¿Qué hacer aquí?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {highlights.map(({ icon: Icon, title, desc }) => (
                          <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-brand-dark border border-brand-steel/10 hover:border-brand-wine/20 transition-colors group">
                            <div className="w-9 h-9 rounded-lg bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-wine/20 transition-colors">
                              <Icon className="h-4 w-4 text-brand-rose" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                              <p className="text-brand-silver/70 text-xs leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Map */}
                {(destination.latitude || destination.longitude) && (
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-4">Ubicación</h2>
                    <DestinationMap
                      name={destination.name}
                      country={destination.country}
                      latitude={destination.latitude}
                      longitude={destination.longitude}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab: Paquetes */}
            {activeTab === 'paquetes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">
                    Paquetes en {destination.name}
                  </h2>
                  <Link href={`${ROUTES.packages}?destination=${destination.id}`} className="text-sm text-brand-silver hover:text-white transition-colors">
                    Ver todos →
                  </Link>
                </div>
                {packagesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => <PackageCardSkeleton key={i} />)}
                  </div>
                ) : packagesData?.packages && packagesData.packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {packagesData.packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center gap-3">
                    <Package className="h-12 w-12 text-brand-steel/30" />
                    <p className="text-white font-semibold">Sin paquetes para este destino</p>
                    <Link href={ROUTES.packages} className="text-sm text-brand-rose hover:text-white transition-colors">Ver todos los paquetes →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Hoteles */}
            {activeTab === 'hoteles' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">
                    Hoteles en {destination.name}
                  </h2>
                  <Link href={ROUTES.hotels} className="text-sm text-brand-silver hover:text-white transition-colors">
                    Ver todos →
                  </Link>
                </div>
                {hotelsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-brand-dark animate-pulse" />)}
                  </div>
                ) : hotelsData?.hotels && hotelsData.hotels.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {hotelsData.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center gap-3">
                    <Hotel className="h-12 w-12 text-brand-steel/30" />
                    <p className="text-white font-semibold">Sin hoteles para este destino</p>
                    <Link href={ROUTES.hotels} className="text-sm text-brand-rose hover:text-white transition-colors">Ver todos los hoteles →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Actividades */}
            {activeTab === 'actividades' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-white">
                    Actividades en {destination.name}
                  </h2>
                  <Link href={ROUTES.activities} className="text-sm text-brand-silver hover:text-white transition-colors">
                    Ver todas →
                  </Link>
                </div>
                {activitiesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-brand-dark animate-pulse" />)}
                  </div>
                ) : activitiesData?.activities && activitiesData.activities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {activitiesData.activities.map((act) => <ActivityCard key={act.id} activity={act} />)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center gap-3">
                    <Zap className="h-12 w-12 text-brand-steel/30" />
                    <p className="text-white font-semibold">Sin actividades para este destino</p>
                    <Link href={ROUTES.activities} className="text-sm text-brand-rose hover:text-white transition-colors">Ver todas las actividades →</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Quick info */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                Informacion rapida
              </h3>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-brand-wine" />
                </div>
                <div>
                  <p className="text-brand-steel text-xs">Continente</p>
                  <p className="text-white font-medium">{destination.continent}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-brand-wine" />
                </div>
                <div>
                  <p className="text-brand-steel text-xs">Pais</p>
                  <p className="text-white font-medium">{destination.country}</p>
                </div>
              </div>

              {destination.best_season && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-wine/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-brand-wine" />
                  </div>
                  <div>
                    <p className="text-brand-steel text-xs">Mejor epoca</p>
                    <p className="text-white font-medium">{destination.best_season}</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-wine/30 to-brand-dark border border-brand-wine/20 p-5">
              <h3 className="font-display text-lg font-bold text-white mb-2">
                ¿Listo para viajar?
              </h3>
              <p className="text-brand-silver text-sm mb-4">
                Explora nuestros paquetes y encuentra la experiencia perfecta.
              </p>
              <Link
                href={ROUTES.packages}
                className="block text-center w-full px-4 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Ver paquetes
              </Link>
            </div>
          </aside>
        </div>

        {/* Recently viewed */}
        <RecentlyViewed
          exclude={{ id: destination.id, type: 'destination' }}
          className="mt-14 border-t border-brand-steel/10 pt-10"
        />
      </div>
    </div>
  )
}
