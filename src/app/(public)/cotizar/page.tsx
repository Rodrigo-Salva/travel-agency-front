'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import {
  MapPin, CalendarDays, Users, DollarSign, MessageSquare,
  Loader2, CheckCircle2, ChevronLeft, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { ROUTES } from '@/lib/constants/routes'

const schema = z.object({
  name:             z.string().min(2, 'Ingresa tu nombre completo'),
  email:            z.string().email('Email inválido'),
  phone:            z.string().optional(),
  destination_text: z.string().min(2, 'Ingresa el destino que deseas visitar'),
  departure_date:   z.string().optional(),
  return_date:      z.string().optional(),
  num_adults:       z.coerce.number().min(1).default(1),
  num_children:     z.coerce.number().min(0).default(0),
  budget:           z.coerce.number().min(0).optional(),
  interests:        z.string().optional(),
  message:          z.string().min(10, 'Cuéntanos un poco más sobre tu viaje ideal'),
})

type FormData = z.infer<typeof schema>

const INTEREST_OPTIONS = [
  'Aventura y trekking', 'Playa y relax', 'Cultura e historia',
  'Gastronomía', 'Naturaleza y ecoturismo', 'Ciudades y compras',
  'Deportes extremos', 'Luna de miel / romántico',
]

export default function CotizarPage() {
  const [sent, setSent] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { num_adults: 1, num_children: 0 },
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      apiClient.post(API.inquiries, {
        ...values,
        inquiry_type: 'quote',
        subject: `Cotización: viaje a ${values.destination_text}`,
        interests: selectedInterests.length > 0
          ? selectedInterests.join(', ') + (values.interests ? `. ${values.interests}` : '')
          : values.interests ?? '',
      }),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Error al enviar la solicitud. Intenta nuevamente.'),
  })

  function toggleInterest(i: string) {
    setSelectedInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

  const fc = 'bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine'

  if (sent) {
    return (
      <div className="min-h-screen bg-brand-darkest flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">¡Solicitud enviada!</h1>
        <p className="text-brand-silver max-w-md mb-2">
          Hemos recibido tu solicitud de cotización. Nuestro equipo la revisará y te
          contactará en menos de <strong className="text-white">24 horas</strong> con una propuesta personalizada.
        </p>
        <p className="text-brand-steel text-sm mb-8">Revisa tu bandeja de entrada (y la carpeta de spam).</p>
        <Link
          href={ROUTES.packages}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          Ver paquetes disponibles
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-darkest">
      {/* Hero */}
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1 text-brand-silver hover:text-white text-sm mb-5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Inicio
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-wine/15 border border-brand-wine/25 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="h-6 w-6 text-brand-rose" />
            </div>
            <div>
              <p className="text-brand-rose text-xs font-bold uppercase tracking-widest mb-2">Paquete a medida</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Solicitar cotización</h1>
              <p className="text-brand-silver mt-2 max-w-xl">
                Diseñamos tu viaje ideal. Cuéntanos a dónde quieres ir y en qué
                fecha, y nuestro equipo te prepara una propuesta personalizada sin costo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">

          {/* Datos de contacto */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-wine" /> Tus datos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre completo *</Label>
                <Input {...register('name')} placeholder="María García" className={fc} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Email *</Label>
                <Input {...register('email')} type="email" placeholder="maria@email.com" className={fc} />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-brand-silver text-xs">Teléfono / WhatsApp (opcional)</Label>
                <Input {...register('phone')} placeholder="+51 999 999 999" className={fc} />
              </div>
            </div>
          </div>

          {/* Detalles del viaje */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-wine" /> Detalles del viaje
            </h2>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Destino(s) deseado(s) *</Label>
              <Input {...register('destination_text')} placeholder="Ej: Cusco y Machu Picchu, Cancún, Europa..." className={fc} />
              {errors.destination_text && <p className="text-red-400 text-xs">{errors.destination_text.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Fecha de salida
                </Label>
                <Input type="date" {...register('departure_date')} className={`${fc} [color-scheme:dark]`} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Fecha de regreso
                </Label>
                <Input type="date" {...register('return_date')} className={`${fc} [color-scheme:dark]`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Adultos</Label>
                <Input type="number" min={1} max={50} {...register('num_adults')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Niños (0-12 años)</Label>
                <Input type="number" min={0} max={20} {...register('num_children')} className={fc} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Presupuesto aproximado por persona (USD)
              </Label>
              <Input type="number" min={0} step={100} {...register('budget')} placeholder="Ej: 1500" className={fc} />
            </div>
          </div>

          {/* Intereses */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white">Intereses y actividades</h2>
            <p className="text-brand-steel text-xs">Selecciona todo lo que aplique (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-brand-wine/20 border-brand-wine/50 text-brand-rose'
                      : 'border-brand-steel/20 text-brand-steel hover:border-brand-steel/40 hover:text-brand-silver'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-wine" /> Cuéntanos más
            </h2>
            <div className="space-y-1.5">
              <Label className="text-brand-silver text-xs">Tu mensaje *</Label>
              <textarea
                {...register('message')}
                rows={5}
                placeholder="Describe tu viaje ideal: tipo de alojamiento, actividades, si es para una ocasión especial, restricciones alimentarias, etc..."
                className={`w-full rounded-xl text-sm px-3 py-2.5 border resize-none focus:outline-none ${fc}`}
              />
              {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-wine text-white font-bold text-base hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
              : <><Sparkles className="h-5 w-5" /> Solicitar mi cotización gratis</>
            }
          </button>
          <p className="text-center text-brand-steel text-xs">Sin compromiso · Respuesta en menos de 24 horas</p>
        </form>
      </div>
    </div>
  )
}
