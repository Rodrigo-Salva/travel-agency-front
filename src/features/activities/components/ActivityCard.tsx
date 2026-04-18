import Image from 'next/image'
import { Clock, Users, Zap, Mountain, Smile } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import type { Activity, ActivityType, DifficultyLevel } from '../types/activity.types'

interface Props {
  activity: Activity
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

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

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; classes: string; icon: typeof Zap }> = {
  easy:     { label: 'Fácil',    classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Smile },
  moderate: { label: 'Moderado', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20',     icon: Mountain },
  difficult:{ label: 'Difícil',  classes: 'text-red-400 bg-red-500/10 border-red-500/20',           icon: Zap },
}

export function ActivityCard({ activity }: Props) {
  const imageUrl = activity.image
    ? activity.image.startsWith('http') ? activity.image : `${BASE_URL}${activity.image}`
    : null

  const diff = DIFFICULTY_CONFIG[activity.difficulty_level]
  const DiffIcon = diff.icon

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:border-brand-wine/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-brand-darkest overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={activity.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-brand-wine/10 to-brand-darkest flex items-center justify-center">
            <Zap className="h-10 w-10 text-brand-steel/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/60 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 border border-brand-steel/20 text-brand-silver">
            {ACTIVITY_LABELS[activity.activity_type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">{activity.name}</h3>

        <p className="text-xs text-brand-steel line-clamp-2 mb-3 flex-1">{activity.description}</p>

        <div className="flex items-center gap-3 text-xs text-brand-steel mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {activity.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Max {activity.max_group_size}
          </span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${diff.classes}`}>
            <DiffIcon className="h-3 w-3" />
            {diff.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-brand-steel/10 mt-auto">
          <div>
            <p className="text-xs text-brand-steel">Por persona</p>
            <p className="font-display text-lg font-bold text-white">{formatPrice(activity.price_per_person)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-brand-steel/10" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="h-3 w-full bg-brand-steel/10 rounded" />
        <div className="h-3 w-2/3 bg-brand-steel/10 rounded" />
        <div className="h-8 w-full bg-brand-wine/10 rounded mt-2" />
      </div>
    </div>
  )
}
