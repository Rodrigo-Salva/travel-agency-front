'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Save, Loader2, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  first_name:      z.string().min(1, 'Requerido'),
  last_name:       z.string().min(1, 'Requerido'),
  phone:           z.string().optional(),
  address:         z.string().optional(),
  city:            z.string().optional(),
  country:         z.string().optional(),
  passport_number: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { setFullUser } = useAuthStore()
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.me(),
    staleTime: 5 * 60 * 1000,
  })

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        first_name:      profile.first_name ?? '',
        last_name:       profile.last_name ?? '',
        phone:           profile.phone ?? '',
        address:         profile.address ?? '',
        city:            profile.city ?? '',
        country:         profile.country ?? '',
        passport_number: profile.passport_number ?? '',
      })
    }
  }, [profile, reset])

  const update = useMutation({
    mutationFn: (values: FormData) => authApi.updateProfile(values),
    onSuccess: (updated) => {
      setFullUser(updated)
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Perfil actualizado')
      reset({
        first_name:      updated.first_name ?? '',
        last_name:       updated.last_name ?? '',
        phone:           updated.phone ?? '',
        address:         updated.address ?? '',
        city:            updated.city ?? '',
        country:         updated.country ?? '',
        passport_number: updated.passport_number ?? '',
      })
    },
    onError: () => toast.error('No se pudo actualizar el perfil'),
  })

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U'

  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-gradient-to-b from-brand-dark to-brand-darkest border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-2">Mi cuenta</p>
          <h1 className="font-display text-4xl font-bold text-white">Mi perfil</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-brand-dark animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit(v => update.mutate(v))} className="space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-brand-wine/20 border border-brand-wine/30 flex items-center justify-center text-brand-rose font-bold text-3xl flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-brand-steel text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />{profile?.email}
                </p>
                <p className="text-brand-steel text-xs mt-1">
                  Usuario: <span className="text-brand-silver">@{profile?.username}</span>
                </p>
              </div>
            </div>

            {/* Datos personales */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-brand-wine" />
                <h2 className="font-semibold text-white">Datos personales</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm">Nombre</Label>
                  <Input {...register('first_name')}
                    className="bg-brand-darkest/60 border-brand-steel/20 text-white" />
                  {errors.first_name && <p className="text-xs text-red-400">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm">Apellido</Label>
                  <Input {...register('last_name')}
                    className="bg-brand-darkest/60 border-brand-steel/20 text-white" />
                  {errors.last_name && <p className="text-xs text-red-400">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />Teléfono
                </Label>
                <Input {...register('phone')} placeholder="+51 999 999 999"
                  className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
              </div>
            </div>

            {/* Ubicación */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-brand-wine" />
                <h2 className="font-semibold text-white">Ubicación</h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-sm">Dirección</Label>
                <Input {...register('address')} placeholder="Av. Principal 123"
                  className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm">Ciudad</Label>
                  <Input {...register('city')} placeholder="Lima"
                    className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-brand-silver text-sm flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />País
                  </Label>
                  <Input {...register('country')} placeholder="Peru"
                    className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
                </div>
              </div>
            </div>

            {/* Viaje */}
            <div className="rounded-2xl bg-brand-dark border border-brand-steel/10 p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-brand-wine" />
                <h2 className="font-semibold text-white">Datos de viaje</h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-brand-silver text-sm">N° de pasaporte</Label>
                <Input {...register('passport_number')} placeholder="AB123456"
                  className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isDirty || update.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {update.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
