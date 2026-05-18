import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Zap, Mountain, Smile, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'
import type { Activity, ActivityType, DifficultyLevel } from '../types/activity.types'

interface Props { activity: Activity }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:8000'

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  sightseeing: 'Turismo', adventure: 'Aventura', cultural: 'Cultural',
  shopping: 'Compras', dining: 'Comida', sports: 'Deportes',
  wellness: 'Bienestar', entertainment: 'Entretenimiento',
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
    <Link href={ROUTES.activity(activity.id)}
      className="group rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden card-depth hover:card-depth-hover hover:border-brand-wine/35 hover:-translate-y-1 transition-all duration-300 flex flex-col">

      <div className="relative h-48 bg-brand-darkest overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={activity.name} fill
            className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-brand-dark to-brand-darkest flex items-center justify-center">
            <Zap className="h-12 w-12 text-brand-steel/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/90 via-brand-darkest/20 to-transparent" />
        <div className="absolute inset-0 bg-brand-wine/0 group-hover:bg-brand-wine/8 transition-colors duration-500" />

        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            {ACTIVITY_LABELS[activity.activity_type]}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm border ${diff.classes}`}>
            <DiffIcon className="h-3 w-3" /> {diff.label}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            <Clock className="h-3 w-3" /> {activity.duration_hours}h
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
            <Users className="h-3 w-3" /> Máx {activity.max_group_size}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-rose transition-colors">{activity.name}</h3>
        <p className="text-xs text-brand-silver/80 line-clamp-2 mb-4 flex-1 leading-relaxed">{activity.description}</p>

        <div className="flex items-end justify-between pt-3 border-t border-brand-steel/10 mt-auto">
          <div>
            <p className="text-[11px] text-brand-steel uppercase tracking-widest mb-0.5">Por persona</p>
            <p className="font-display text-xl font-bold text-white leading-none">{formatPrice(activity.price_per_person)}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-wine/15 group-hover:bg-brand-wine border border-brand-wine/20 group-hover:border-brand-wine text-brand-rose group-hover:text-white transition-all duration-300">
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 card-depth overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-b from-brand-steel/10 to-brand-darkest/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-brand-steel/20 rounded" />
        <div className="h-3 w-full bg-brand-steel/10 rounded" />
        <div className="h-px w-full bg-brand-steel/10" />
        <div className="flex justify-between items-end">
          <div className="h-6 w-20 bg-brand-steel/20 rounded" />
          <div className="h-10 w-10 bg-brand-wine/10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
