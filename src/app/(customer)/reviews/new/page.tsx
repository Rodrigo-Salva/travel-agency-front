'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Star, Loader2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { bookingsApi } from '@/features/bookings/api/bookings.api'
import { reviewsApi } from '@/features/reviews/api/reviews.api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'

const schema = z.object({
  overall_rating:        z.number().min(1).max(5),
  accommodation_rating:  z.number().min(1).max(5).optional(),
  transport_rating:      z.number().min(1).max(5).optional(),
  guide_rating:          z.number().min(1).max(5).optional(),
  value_rating:          z.number().min(1).max(5).optional(),
  title:   z.string().min(3, 'Mínimo 3 caracteres'),
  comment: z.string().min(20, 'Mínimo 20 caracteres'),
  pros:    z.string().optional(),
  cons:    z.string().optional(),
})
type FormData = z.infer<typeof schema>

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center justify-between">
      <span className="text-brand-silver text-sm">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button
            key={s} type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="p-0.5"
          >
            <Star className={`h-5 w-5 transition-colors ${s <= (hover || value) ? 'fill-brand-wine text-brand-wine' : 'text-brand-steel/40'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NewReviewPage() {
  const router = useRouter()
  const params = useSearchParams()
  const bookingId = params.get('booking') ? Number(params.get('booking')) : undefined

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings-completed'],
    queryFn: () => bookingsApi.list(),
    select: d => d.filter(b => b.status === 'completed'),
    staleTime: 2 * 60 * 1000,
  })

  const [selectedBooking, setSelectedBooking] = useState<number | undefined>(bookingId)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { overall_rating: 0, title: '', comment: '' },
  })

  const ratings = {
    overall:       watch('overall_rating') ?? 0,
    accommodation: watch('accommodation_rating') ?? 0,
    transport:     watch('transport_rating') ?? 0,
    guide:         watch('guide_rating') ?? 0,
    value:         watch('value_rating') ?? 0,
  }

  const submit = useMutation({
    mutationFn: (values: FormData) => {
      const booking = bookings.find(b => b.id === selectedBooking)
      if (!booking) throw new Error('Selecciona una reserva')
      return reviewsApi.create({
        booking: selectedBooking!,
        package: (booking as any).package ?? 0,
        ...values,
      })
    },
    onSuccess: () => {
      toast.success('¡Reseña enviada! Será revisada pronto.')
      router.push(ROUTES.customer.bookings)
    },
    onError: (e: any) => toast.error(e?.message ?? 'Error al enviar la reseña'),
  })

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <Link href={ROUTES.customer.bookings} className="inline-flex items-center gap-1 text-brand-silver hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Mis reservas
          </Link>
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-2">Mi cuenta</p>
          <h1 className="font-display text-4xl font-bold text-white">Escribir reseña</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <form onSubmit={handleSubmit(v => submit.mutate(v))} className="space-y-6">

          {/* Seleccionar reserva */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white">¿Sobre qué viaje es la reseña?</h2>
            {loadingBookings ? (
              <div className="h-12 rounded-xl bg-brand-darkest animate-pulse" />
            ) : bookings.length === 0 ? (
              <p className="text-brand-steel text-sm">No tienes viajes completados aun.</p>
            ) : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <button
                    key={b.id} type="button"
                    onClick={() => setSelectedBooking(b.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                      selectedBooking === b.id
                        ? 'border-brand-wine bg-brand-wine/10 text-white'
                        : 'border-brand-steel/20 text-brand-silver hover:border-brand-steel/40'
                    }`}
                  >
                    <span className="font-mono text-xs mr-2 text-brand-steel">#{b.booking_number}</span>
                    {b.travel_date ?? 'Sin fecha'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calificaciones */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white">Calificaciones</h2>
            <StarRating value={ratings.overall} onChange={v => setValue('overall_rating', v)} label="Calificación general *" />
            {errors.overall_rating && <p className="text-xs text-red-400">Selecciona una calificación</p>}
            <div className="border-t border-brand-steel/10 pt-4 space-y-3">
              <p className="text-xs text-brand-steel uppercase tracking-wider">Opcional</p>
              <StarRating value={ratings.accommodation} onChange={v => setValue('accommodation_rating', v)} label="Alojamiento" />
              <StarRating value={ratings.transport} onChange={v => setValue('transport_rating', v)} label="Transporte" />
              <StarRating value={ratings.guide} onChange={v => setValue('guide_rating', v)} label="Guía" />
              <StarRating value={ratings.value} onChange={v => setValue('value_rating', v)} label="Relación calidad/precio" />
            </div>
          </div>

          {/* Comentario */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white">Tu opinión</h2>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-sm">Título *</Label>
              <Input {...register('title')} placeholder="Ej: Viaje increíble a Cusco"
                className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-sm">Comentario *</Label>
              <textarea
                {...register('comment')}
                rows={5}
                placeholder="Cuéntanos sobre tu experiencia..."
                className="w-full rounded-xl bg-brand-darkest/60 border border-brand-steel/20 text-white placeholder:text-brand-steel text-sm px-3 py-2.5 focus:outline-none focus:border-brand-wine resize-none"
              />
              {errors.comment && <p className="text-xs text-red-400">{errors.comment.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-sm">Lo mejor (opcional)</Label>
                <textarea
                  {...register('pros')} rows={3}
                  placeholder="Lo que más te gustó..."
                  className="w-full rounded-xl bg-brand-darkest/60 border border-brand-steel/20 text-white placeholder:text-brand-steel text-sm px-3 py-2.5 focus:outline-none focus:border-brand-wine resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-sm">A mejorar (opcional)</Label>
                <textarea
                  {...register('cons')} rows={3}
                  placeholder="Qué podría mejorar..."
                  className="w-full rounded-xl bg-brand-darkest/60 border border-brand-steel/20 text-white placeholder:text-brand-steel text-sm px-3 py-2.5 focus:outline-none focus:border-brand-wine resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submit.isPending || !selectedBooking}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {submit.isPending ? 'Enviando...' : 'Enviar reseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
