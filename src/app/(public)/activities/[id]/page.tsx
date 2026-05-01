'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Zap, Mountain, Smile, MapPin, ChevronRight, MessageSquare } from 'lucide-react'
import { useActivity } from '@/features/activities/hooks/useActivities'
import { ROUTES } from '@/lib/constants/routes'
import { formatPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import type { ActivityType, DifficultyLevel } from '@/features/activities/types/activity.types'
import { InlineReviewSection } from '@/features/reviews/components/InlineReviewSection'

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

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="relative h-[360px] bg-brand-dark overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={activity.name} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-wine/10 to-brand-darkest" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-brand-darkest/30 to-transparent" />

        <div className="absolute top-6 left-0 right-0 container mx-auto px-4">
          <Link href={ROUTES.activities} className="inline-flex items-center gap-2 text-sm text-brand-silver hover:text-white transition-colors bg-brand-darkest/60 backdrop-blur-sm px-3 py-2 rounded-lg">
            <ArrowLeft className="h-4 w-4" /> Todas las actividades
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-brand-wine/90 border-0 text-white">
              {ACTIVITY_LABELS[activity.activity_type]}
            </Badge>
            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${diff.classes}`}>
              <DiffIcon className="h-3.5 w-3.5" />
              {diff.label}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">{activity.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Descripcion</h2>
              <p className="text-brand-silver leading-relaxed text-base">{activity.description}</p>
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
