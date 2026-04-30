'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star, CheckCircle2, MessageSquare, PenLine } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants/routes'
import { reviewsApi } from '../api/reviews.api'
import { formatDate } from '@/lib/utils/format'
import { ReviewForm } from './ReviewForm'
import type { Review } from '../types/review.types'

interface Props {
  label?: string
}

function StarRow({ rating, label }: { rating: number | null; label: string }) {
  if (!rating) return null
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-brand-steel">{label}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{review.customer_name || 'Cliente'}</span>
            {review.is_verified && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Verificado
              </span>
            )}
            {!review.is_approved && (
              <span className="text-xs text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">Pendiente</span>
            )}
          </div>
          <p className="text-xs text-brand-steel mt-0.5">{formatDate(review.created_at)}</p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < review.overall_rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
          ))}
        </div>
      </div>

      {(review.title || review.comment) && (
        <div>
          {review.title && <p className="font-semibold text-white text-sm mb-1">{review.title}</p>}
          {review.comment && <p className="text-brand-silver text-sm leading-relaxed">{review.comment}</p>}
        </div>
      )}

      {(review.accommodation_rating || review.transport_rating || review.guide_rating || review.value_rating) && (
        <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-brand-steel/10">
          <StarRow rating={review.accommodation_rating} label="Alojamiento" />
          <StarRow rating={review.transport_rating}     label="Transporte" />
          <StarRow rating={review.guide_rating}         label="Guia" />
          <StarRow rating={review.value_rating}         label="Calidad-precio" />
        </div>
      )}

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-brand-steel/10">
          {review.pros && (
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">+ Lo mejor</p>
              <p className="text-xs text-brand-silver">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">- A mejorar</p>
              <p className="text-xs text-brand-silver">{review.cons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function InlineReviewSection({ label }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [showForm, setShowForm] = useState(false)

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews-general'],
    queryFn: () => reviewsApi.listGeneral(),
    staleTime: 2 * 60 * 1000,
    enabled: true,
  })

  // Only show reviews without a package (hotel/activity reviews)
  const localReviews = reviews.filter((r: Review) => !r.package)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 animate-pulse space-y-3">
            <div className="h-4 w-32 bg-brand-steel/20 rounded" />
            <div className="h-3 w-full bg-brand-steel/10 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Write button */}
      {isAuthenticated && !showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
          >
            <PenLine className="h-4 w-4" /> Escribir reseña
          </button>
        </div>
      )}

      {/* Inline form */}
      {isAuthenticated && showForm && (
        <ReviewForm
          label={label}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Reviews list */}
      {localReviews.length > 0 ? (
        <div className="space-y-4">
          {localReviews.map((r: Review) => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : !showForm && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageSquare className="h-10 w-10 text-brand-steel/30 mb-3" />
          <p className="text-brand-silver font-medium">Sin reseñas aun</p>
          <p className="text-brand-steel text-sm mt-1">Sé el primero en compartir tu experiencia</p>
          {!isAuthenticated && (
            <Link
              href={ROUTES.auth.login}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-wine/40 text-brand-wine text-sm font-semibold hover:bg-brand-wine/10 transition-colors"
            >
              Inicia sesión para reseñar
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
