'use client'

import { useState } from 'react'
import { Star, CheckCircle2, MessageSquare, PenLine } from 'lucide-react'
import { useReviews } from '../hooks/useReviews'
import { formatDate } from '@/lib/utils/format'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/lib/constants/routes'
import { ReviewForm } from './ReviewForm'
import Link from 'next/link'

interface Props {
  packageId: number
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

export function ReviewList({ packageId }: Props) {
  const { data: reviews = [], isLoading } = useReviews(packageId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [showForm, setShowForm] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 animate-pulse space-y-3">
            <div className="h-4 w-32 bg-brand-steel/20 rounded" />
            <div className="h-3 w-full bg-brand-steel/10 rounded" />
            <div className="h-3 w-3/4 bg-brand-steel/10 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-5">
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
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-brand-wine/30 text-brand-wine text-sm font-semibold hover:bg-brand-wine/10 transition-colors"
          >
            <PenLine className="h-4 w-4" /> Escribir reseña
          </button>
        )}
        {isAuthenticated && showForm && (
          <ReviewForm packageId={packageId} onClose={() => setShowForm(false)} />
        )}
      </div>
    )
  }

  const avgOverall = reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length

  return (
    <div className="space-y-5">
      {/* Write review toggle */}
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
        <ReviewForm packageId={packageId} onClose={() => setShowForm(false)} />
      )}

      {/* Summary bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-dark border border-brand-steel/10">
        <div className="text-center">
          <p className="font-display text-4xl font-bold text-white">{avgOverall.toFixed(1)}</p>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgOverall) ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
            ))}
          </div>
          <p className="text-xs text-brand-steel mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.overall_rating === star).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-brand-steel w-4 text-right">{star}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 bg-brand-steel/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-brand-steel w-4">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review cards */}
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl bg-brand-dark border border-brand-steel/10 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{review.customer_name || 'Cliente'}</span>
                {review.is_verified && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Verificado
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-steel mt-0.5">{formatDate(review.created_at)}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < review.overall_rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-white text-sm mb-1">{review.title}</p>
            <p className="text-brand-silver text-sm leading-relaxed">{review.comment}</p>
          </div>
          {(review.accommodation_rating || review.transport_rating || review.guide_rating || review.value_rating) && (
            <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-brand-steel/10">
              <StarRow rating={review.accommodation_rating} label="Alojamiento" />
              <StarRow rating={review.transport_rating} label="Transporte" />
              <StarRow rating={review.guide_rating} label="Guia" />
              <StarRow rating={review.value_rating} label="Calidad-precio" />
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
      ))}
    </div>
  )
}
