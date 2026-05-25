'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Star, MessageSquare, CheckCircle2, Clock, Plus } from 'lucide-react'
import { reviewsApi } from '@/features/reviews/api/reviews.api'
import { formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants/routes'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-brand-steel/30'}`} />
      ))}
    </div>
  )
}

export default function MyReviewsPage() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewsApi.listMine(),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark pt-16 pb-8 border-b border-brand-steel/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-rose text-xs font-bold uppercase tracking-widest mb-2">Mi cuenta</p>
              <h1 className="font-display text-4xl font-bold text-white">Mis reseñas</h1>
            </div>
            <Link
              href={ROUTES.customer.bookings}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva reseña
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-brand-dark border border-brand-steel/10 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <MessageSquare className="h-16 w-16 text-brand-steel/40" />
            <h2 className="text-2xl font-bold text-white">Sin reseñas aún</h2>
            <p className="text-brand-silver max-w-sm">
              Completa un viaje y comparte tu experiencia con otros viajeros.
            </p>
            <Link
              href={ROUTES.customer.bookings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
            >
              Ver mis reservas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-brand-steel mb-6">
              {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} en total
            </p>
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl bg-brand-dark border border-brand-steel/10 overflow-hidden hover:border-brand-wine/20 transition-all">
                <div className="flex items-center justify-between px-5 py-3 border-b border-brand-steel/10 bg-brand-darkest/30">
                  <div className="flex items-center gap-3">
                    <StarRow rating={r.overall_rating} />
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {r.is_approved ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {r.is_approved ? 'Aprobada' : 'Pendiente aprobación'}
                    </span>
                  </div>
                  <span className="text-xs text-brand-steel">{formatDate(r.created_at)}</span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1">{r.title}</h3>
                  <p className="text-brand-silver text-sm leading-relaxed line-clamp-3">{r.comment}</p>

                  {(r.pros || r.cons) && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {r.pros && (
                        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                          <p className="text-xs text-emerald-400 font-medium mb-1">Lo mejor</p>
                          <p className="text-xs text-brand-silver line-clamp-2">{r.pros}</p>
                        </div>
                      )}
                      {r.cons && (
                        <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
                          <p className="text-xs text-red-400 font-medium mb-1">Por mejorar</p>
                          <p className="text-xs text-brand-silver line-clamp-2">{r.cons}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {(r.accommodation_rating || r.transport_rating || r.guide_rating || r.value_rating) && (
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-brand-steel">
                      {r.accommodation_rating && <span>Alojamiento: <span className="text-amber-400 font-medium">{r.accommodation_rating}★</span></span>}
                      {r.transport_rating && <span>Transporte: <span className="text-amber-400 font-medium">{r.transport_rating}★</span></span>}
                      {r.guide_rating && <span>Guía: <span className="text-amber-400 font-medium">{r.guide_rating}★</span></span>}
                      {r.value_rating && <span>Precio/valor: <span className="text-amber-400 font-medium">{r.value_rating}★</span></span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
