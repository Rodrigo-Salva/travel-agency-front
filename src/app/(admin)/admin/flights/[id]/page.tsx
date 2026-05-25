'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

interface Props { params: Promise<{ id: string }> }

export default function EditFlightPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

  const { data: flight, isLoading } = useQuery({
    queryKey: queryKeys.flights.detail(Number(id)),
    queryFn: async () => {
      const { data } = await apiClient.get(API.flight(Number(id)))
      return data.vuelo ?? data
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    values: flight ? {
      airline_name: flight.airline_name,
      airline_code: flight.airline_code,
      flight_number: flight.flight_number,
      origin_city: flight.origin_city,
      destination_city: flight.destination_city,
      origin_airport: flight.origin_airport,
      destination_airport: flight.destination_airport,
      departure_time: flight.departure_time?.slice(0, 16) ?? '',
      arrival_time: flight.arrival_time?.slice(0, 16) ?? '',
      flight_class: flight.flight_class,
      price: parseFloat(flight.price),
      available_seats: flight.available_seats,
      baggage_allowance: flight.baggage_allowance ?? '',
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: FormData) => apiClient.patch(API.flight(Number(id)), values),
    onSuccess: () => {
      toast.success('Vuelo actualizado correctamente')
      qc.invalidateQueries({ queryKey: queryKeys.flights.all })
      router.push(ROUTES.admin.flights)
    },
    onError: () => toast.error('Error al actualizar el vuelo'),
  })

  const fc = 'bg-brand-darkest border-brand-steel/20 text-white focus:border-brand-wine'

  if (isLoading) return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand-wine animate-spin" />
    </div>
  )

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
              <Plane className="h-5 w-5 text-brand-wine" /> Editar vuelo {flight?.flight_number}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit((v: FormData) => mutation.mutate(v))} className="space-y-6">

          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Aerolínea</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Aerolínea *</Label><Input {...register('airline_name')} className={fc} />{errors.airline_name && <p className="text-red-400 text-xs">{errors.airline_name.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Código *</Label><Input {...register('airline_code')} className={fc} />{errors.airline_code && <p className="text-red-400 text-xs">{errors.airline_code.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">N° vuelo *</Label><Input {...register('flight_number')} className={fc} />{errors.flight_number && <p className="text-red-400 text-xs">{errors.flight_number.message}</p>}</div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Clase</Label><select {...register('flight_class')} className={`w-full rounded-xl px-3 py-2 text-sm ${fc}`}>{FLIGHT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Ruta</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Ciudad origen *</Label><Input {...register('origin_city')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Ciudad destino *</Label><Input {...register('destination_city')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Aeropuerto origen *</Label><Input {...register('origin_airport')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Aeropuerto destino *</Label><Input {...register('destination_airport')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Salida *</Label><Input type="datetime-local" {...register('departure_time')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Llegada *</Label><Input type="datetime-local" {...register('arrival_time')} className={fc} /></div>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-5 space-y-4">
            <p className="text-brand-steel text-xs uppercase tracking-wider font-semibold">Capacidad y precio</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Precio</Label><Input type="number" step="0.01" {...register('price')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Asientos</Label><Input type="number" {...register('available_seats')} className={fc} /></div>
              <div className="space-y-1.5"><Label className="text-brand-silver text-xs">Equipaje</Label><Input {...register('baggage_allowance')} className={fc} /></div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={ROUTES.admin.flights} className="px-5 py-2.5 rounded-xl border border-brand-steel/20 text-brand-silver text-sm hover:text-white hover:bg-brand-steel/10 transition-colors">Cancelar</Link>
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
