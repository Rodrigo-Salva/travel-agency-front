'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Loader2, Plane } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import { ROUTES } from '@/lib/constants/routes'
import { queryKeys } from '@/lib/query/keys'

const FLIGHT_CLASSES = ['Economy', 'Business', 'First'] as const

const schema = z.object({
  airline_name: z.string().min(2, 'Requerido'),
  airline_code: z.string().min(2, 'Requerido').max(4),
  flight_number: z.string().min(2, 'Requerido'),
  origin_city: z.string().min(2, 'Requerido'),
  destination_city: z.string().min(2, 'Requerido'),
  origin_airport: z.string().min(2, 'Requerido'),
  destination_airport: z.string().min(2, 'Requerido'),
  departure_time: z.string().min(1, 'Requerido'),
  arrival_time: z.string().min(1, 'Requerido'),
  flight_class: z.enum(FLIGHT_CLASSES),
  price: z.coerce.number().min(0),
  available_seats: z.coerce.number().min(1),
  baggage_allowance: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function NewFlightPage() {
  const router = useRouter()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { flight_class: 'Economy', available_seats: 100 },
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => apiClient.post(API.flights, values),
    onSuccess: () => {
      toast.success('Vuelo creado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.flights.all })
      router.push(ROUTES.admin.flights)
    },
    onError: () => toast.error('Error al crear el vuelo'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.admin.flights} className="p-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-steel/10 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-brand-wine text-xs font-semibold uppercase tracking-widest">Vuelos</p>
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Plane className="h-5 w-5 text-brand-wine" /> Nuevo vuelo
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit((v: FormData) => mutation.mutate(v))} className="space-y-6">

          {/* Aerolínea */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Aerolínea</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Nombre aerolínea *</Label>
                <Input {...register('airline_name')} className={fc} placeholder="ej. LATAM Airlines" />
                {errors.airline_name && <p className="text-red-400 text-xs">{errors.airline_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Código aerolínea *</Label>
                <Input {...register('airline_code')} className={fc} placeholder="ej. LA" />
                {errors.airline_code && <p className="text-red-400 text-xs">{errors.airline_code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">N° de vuelo *</Label>
                <Input {...register('flight_number')} className={fc} placeholder="ej. LA2055" />
                {errors.flight_number && <p className="text-red-400 text-xs">{errors.flight_number.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Clase</Label>
                <select {...register('flight_class')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>
                  {FLIGHT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Ruta */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Ruta</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Ciudad origen *</Label>
                <Input {...register('origin_city')} className={fc} placeholder="ej. Lima" />
                {errors.origin_city && <p className="text-red-400 text-xs">{errors.origin_city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Ciudad destino *</Label>
                <Input {...register('destination_city')} className={fc} placeholder="ej. Cusco" />
                {errors.destination_city && <p className="text-red-400 text-xs">{errors.destination_city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Aeropuerto origen *</Label>
                <Input {...register('origin_airport')} className={fc} placeholder="ej. LIM" />
                {errors.origin_airport && <p className="text-red-400 text-xs">{errors.origin_airport.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Aeropuerto destino *</Label>
                <Input {...register('destination_airport')} className={fc} placeholder="ej. CUZ" />
                {errors.destination_airport && <p className="text-red-400 text-xs">{errors.destination_airport.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Salida *</Label>
                <Input type="datetime-local" {...register('departure_time')} className={fc} />
                {errors.departure_time && <p className="text-red-400 text-xs">{errors.departure_time.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Llegada *</Label>
                <Input type="datetime-local" {...register('arrival_time')} className={fc} />
                {errors.arrival_time && <p className="text-red-400 text-xs">{errors.arrival_time.message}</p>}
              </div>
            </div>
          </div>

          {/* Capacidad y precio */}
          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Capacidad y precio</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Precio (USD)</Label>
                <Input type="number" step="0.01" {...register('price')} className={fc} />
                {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Asientos disponibles</Label>
                <Input type="number" {...register('available_seats')} className={fc} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-xs">Equipaje permitido</Label>
                <Input {...register('baggage_allowance')} className={fc} placeholder="ej. 23kg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.flights} className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">Cancelar</Link>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Crear vuelo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
