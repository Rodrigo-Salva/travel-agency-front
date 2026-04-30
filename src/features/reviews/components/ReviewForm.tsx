'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { Star, Loader2, X, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { reviewsApi } from '../api/reviews.api'

interface Props {
  packageId?: number
  onClose?: () => void
  label?: string
}

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

function StarPicker({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-brand-silver text-sm w-36">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s} type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s === value ? 0 : s)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star className={`h-5 w-5 transition-colors ${s <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-brand-steel/30'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReviewForm({ packageId, onClose, label }: Props) {
  const qc = useQueryClient()
  const [overall, setOverall] = useState(0)
  const [hoverOverall, setHoverOverall] = useState(0)
  const [accommodation, setAccommodation] = useState(0)
  const [transport, setTransport] = useState(0)
  const [guide, setGuide] = useState(0)
  const [value, setValue] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        ...(packageId ? { package: packageId } : {}),
        overall_rating: overall,
        ...(accommodation ? { accommodation_rating: accommodation } : {}),
        ...(transport     ? { transport_rating:     transport     } : {}),
        ...(guide         ? { guide_rating:          guide         } : {}),
        ...(value         ? { value_rating:           value         } : {}),
        ...(title.trim()   ? { title:   title.trim()   } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(pros.trim()    ? { pros:    pros.trim()    } : {}),
        ...(cons.trim()    ? { cons:    cons.trim()    } : {}),
      } as any),
    onSuccess: () => {
      setSubmitted(true)
      if (packageId) qc.invalidateQueries({ queryKey: queryKeys.reviews.byPackage(packageId) })
      else qc.invalidateQueries({ queryKey: ['reviews-general'] })
      toast.success('¡Reseña enviada! Será visible una vez aprobada.')
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.errores
        ? Object.values(e.response.data.errores).flat().join(', ')
        : 'Error al enviar la reseña'
      toast.error(msg)
    },
  })

  if (submitted) {
    return (
      <div className="rounded-2xl bg-brand-dark border border-emerald-500/20 p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Star className="h-6 w-6 text-emerald-400 fill-emerald-400" />
        </div>
        <p className="font-semibold text-white">¡Gracias por tu reseña!</p>
        <p className="text-brand-steel text-sm">Será visible una vez que la aprobemos.</p>
        {onClose && (
          <button onClick={onClose} className="text-xs text-brand-steel hover:text-white transition-colors underline">
            Cerrar
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-brand-dark border border-brand-wine/20 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          {label ?? 'Escribe tu reseña'}
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-brand-steel hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Overall stars — only required */}
      <div className="rounded-xl bg-brand-darkest/60 p-5 text-center space-y-3">
        <p className="text-brand-steel text-xs uppercase tracking-wider">Calificación general *</p>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s} type="button"
              onMouseEnter={() => setHoverOverall(s)}
              onMouseLeave={() => setHoverOverall(0)}
              onClick={() => setOverall(s)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star className={`h-10 w-10 transition-colors ${s <= (hoverOverall || overall) ? 'fill-amber-400 text-amber-400' : 'text-brand-steel/30'}`} />
            </button>
          ))}
        </div>
        {(hoverOverall || overall) > 0 && (
          <p className="text-sm text-amber-400 font-semibold">{LABELS[hoverOverall || overall]}</p>
        )}
      </div>

      {/* Optional extras toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-2 text-sm text-brand-steel hover:text-brand-silver transition-colors py-1"
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showMore ? 'Ocultar detalles' : 'Agregar detalles opcionales'}
      </button>

      {showMore && (
        <div className="space-y-5">
          {/* Sub-ratings */}
          <div className="rounded-xl bg-brand-darkest/40 border border-brand-steel/10 p-4 space-y-1">
            <p className="text-xs text-brand-steel uppercase tracking-wider mb-3">Calificaciones específicas</p>
            <StarPicker value={accommodation} onChange={setAccommodation} label="Alojamiento" />
            <StarPicker value={transport}     onChange={setTransport}     label="Transporte" />
            <StarPicker value={guide}         onChange={setGuide}         label="Guía" />
            <StarPicker value={value}         onChange={setValue}         label="Calidad-precio" />
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="w-full bg-brand-darkest/60 border border-brand-steel/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine"
          />

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Comentario (opcional)"
            className="w-full bg-brand-darkest/60 border border-brand-steel/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-brand-wine resize-none"
          />

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-emerald-400 font-semibold">+ Lo mejor (opcional)</p>
              <textarea
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                rows={2}
                placeholder="Lo que más te gustó..."
                className="w-full bg-brand-darkest/60 border border-brand-steel/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-emerald-500/40 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-red-400 font-semibold">- A mejorar (opcional)</p>
              <textarea
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                rows={2}
                placeholder="Qué podría mejorar..."
                className="w-full bg-brand-darkest/60 border border-brand-steel/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-brand-steel/50 focus:outline-none focus:border-red-500/40 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!overall) return toast.error('Selecciona al menos una estrella')
          submit.mutate()
        }}
        disabled={submit.isPending || overall === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submit.isPending ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </div>
  )
}
