'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Zap, Mountain, Smile, MapPin, ChevronRight, MessageSquare, CheckCircle2, Shield, Camera, Coffee, Utensils, Shirt, AlertTriangle } from 'lucide-react'
import { useActivity } from '@/features/activities/hooks/useActivities'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import type { ActivityType, DifficultyLevel } from '@/features/activities/types/activity.types'
import { InlineReviewSection } from '@/features/reviews/components/InlineReviewSection'
import { PackageGallery } from '@/components/packages/PackageGallery'

interface Props {
  params: Promise<{ id: string }>
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  sightseeing: 'Turismo',
  adventure: 'Aventura',
  cultural: 'Cultural',
  shopping: 'Compras',
  dining: 'Comida',
  sports: 'Deportes',
  wellness: 'Bienestar',
  entertainment: 'Entretenimiento',
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; classes: string; icon: typeof Zap; bar: string }> = {
  easy:     { label: 'Fácil',    classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Smile,    bar: 'w-1/3 bg-emerald-400' },
  moderate: { label: 'Moderado', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20',     icon: Mountain, bar: 'w-2/3 bg-amber-400' },
  difficult:{ label: 'Difícil',  classes: 'text-red-400 bg-red-500/10 border-red-500/20',           icon: Zap,      bar: 'w-full bg-red-400' },
}

export default function ActivityDetailPage({ params }: Props) {
  const { id } = use(params)
  const { data: activity, isLoading, isError } = useActivity(id)

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'
  const imageUrl = activity?.image
    ? activity.image.startsWith('http') ? activity.image : `${BASE_URL}${activity.image}`
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darkest animate-pulse">
        <div className="h-72 bg-brand-dark" />
        <div className="container mx-auto px-4 py-10 space-y-4">
          <div className="h-8 w-64 bg-brand-steel/20 rounded" />
          <div className="h-4 w-full max-w-2xl bg-brand-steel/10 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !activity) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center gap-4">
        <Zap className="h-16 w-16 text-brand-steel/40" />
        <h2 className="text-2xl font-bold text-white">Actividad no encontrada</h2>
        <Link href={ROUTES.activities} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-wine text-white text-sm font-medium hover:bg-brand-wine/90 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a actividades
        </Link>
      </div>
    )
  }

  const diff = DIFFICULTY_CONFIG[activity.difficulty_level]
  const DiffIcon = diff.icon

  const galleryImages = [
    ...(imageUrl ? [imageUrl] : []),
    ...(activity.images ?? []).map((img: { image: string }) => {
      const src = img.image
      return src.startsWith('http') ? src : `${BASE_URL}${src}`
    }),
  ]

  // Qué incluye según el tipo de actividad
  const INCLUDES_BY_TYPE: Record<ActivityType, { icon: typeof CheckCircle2; text: string }[]> = {
    adventure:     [{ icon: Shield, text: 'Equipo de seguridad' }, { icon: Users, text: 'Guía certificado' }, { icon: Camera, text: 'Fotos del recorrido' }],
    sightseeing:   [{ icon: Users, text: 'Guía turístico' }, { icon: Camera, text: 'Paradas fotográficas' }, { icon: Coffee, text: 'Refrigerio incluido' }],
    cultural:      [{ icon: Users, text: 'Guía cultural bilingüe' }, { icon: Camera, text: 'Material informativo' }, { icon: Coffee, text: 'Degustación local' }],
    dining:        [{ icon: Utensils, text: 'Menú degustación' }, { icon: Coffee, text: 'Bebidas incluidas' }, { icon: Users, text: 'Chef anfitrión' }],
    sports:        [{ icon: Shield, text: 'Equipo deportivo' }, { icon: Users, text: 'Instructor certificado' }, { icon: Shirt, text: 'Uniforme incluido' }],
    wellness:      [{ icon: Coffee, text: 'Bebidas naturales' }, { icon: Shield, text: 'Productos naturales' }, { icon: Users, text: 'Instructor especializado' }],
    shopping:      [{ icon: Users, text: 'Guía de compras' }, { icon: Camera, text: 'Recorrido por mercados' }, { icon: Coffee, text: 'Snack incluido' }],
    entertainment: [{ icon: Camera, text: 'Acceso a show' }, { icon: Coffee, text: 'Bebida de bienvenida' }, { icon: Users, text: 'Anfitrión en vivo' }],
  }

  const includes = INCLUDES_BY_TYPE[activity.activity_type] ?? []

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-brand-darkest/90 backdrop-blur-md border-b border-brand-steel/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={ROUTES.activities} className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Todas las actividades
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-wine/90 border-0 text-white">
              {ACTIVITY_LABELS[activity.activity_type]}
            </Badge>
            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${diff.classes}`}>
              <DiffIcon className="h-3.5 w-3.5" />
              {diff.label}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-4">
        <Breadcrumbs items={[{ label: 'Actividades', href: ROUTES.activities }, { label: activity.name }]} />
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">{activity.name}</h1>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-10">
            <PackageGallery images={galleryImages} alt={activity.name} />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Descripción</h2>
              <p className="text-brand-silver leading-relaxed text-base">{activity.description}</p>
            </div>

            {/* Qué incluye */}
            {includes.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">¿Qué incluye?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {includes.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 p-4 rounded-xl bg-brand-dark border border-brand-steel/10 hover:border-brand-wine/20 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-wine/20 transition-colors">
                        <Icon className="h-4 w-4 text-brand-rose" />
                      </div>
                      <span className="text-sm text-brand-silver">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qué llevar */}
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-semibold text-sm mb-1">Qué llevar</p>
                <p className="text-brand-silver/80 text-sm leading-relaxed">
                  Ropa cómoda, calzado apropiado, protector solar, agua y documento de identidad.
                  {activity.difficulty_level === 'difficult' && ' Condición física apta para actividades de alta exigencia.'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 text-center">
                <Clock className="h-6 w-6 text-brand-wine mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">{activity.duration_hours}h</p>
                <p className="text-brand-steel text-xs">Duracion</p>
              </div>
              <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 text-center">
                <Users className="h-6 w-6 text-brand-wine mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">{activity.max_group_size}</p>
                <p className="text-brand-steel text-xs">Max. personas</p>
              </div>
              <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-4 text-center col-span-2 sm:col-span-1">
                <DiffIcon className={`h-6 w-6 mx-auto mb-2 ${diff.classes.split(' ')[0]}`} />
                <p className="text-white font-semibold">{diff.label}</p>
                <p className="text-brand-steel text-xs">Dificultad</p>
                <div className="mt-2 h-1.5 rounded-full bg-brand-steel/20 overflow-hidden">
                  <div className={`h-full rounded-full ${diff.bar}`} />
                </div>
              </div>
            </div>

            {/* Reseñas */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-brand-wine" />
                Reseñas
              </h2>
              <InlineReviewSection label={`Reseña de ${activity.name}`} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Price + CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-wine/20 to-brand-dark border border-brand-wine/20 p-5">
              <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Precio por persona</p>
              <p className="font-display text-3xl font-bold text-white mb-4">{formatPrice(activity.price_per_person)}</p>
              <Link
                href={`${ROUTES.contact}?actividad=${encodeURIComponent(activity.name)}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
              >
                Reservar actividad
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={ROUTES.packages}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm font-medium hover:text-white hover:bg-brand-dark mt-2 transition-colors"
              >
                Ver paquetes
              </Link>
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Detalles</h3>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Tipo</p>
                  <p className="text-white">{ACTIVITY_LABELS[activity.activity_type]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Duracion</p>
                  <p className="text-white">{activity.duration_hours} horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-brand-wine flex-shrink-0" />
                <div>
                  <p className="text-brand-steel text-xs">Grupo maximo</p>
                  <p className="text-white">{activity.max_group_size} personas</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
