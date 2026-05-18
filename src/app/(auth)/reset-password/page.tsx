'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/features/auth/api/auth.api'
import { ROUTES } from '@/lib/constants/routes'

const schema = z.object({
  new_password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      authApi.resetPassword({ token, ...data }),
    onSuccess: () => setDone(true),
  })

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Enlace inválido</h1>
        <p className="text-brand-silver text-sm">Este enlace no es válido o ya expiró.</p>
        <Link href={ROUTES.auth.forgotPassword}
          className="inline-flex items-center justify-center mt-2 px-6 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">¡Contraseña restablecida!</h1>
        <p className="text-brand-silver text-sm">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <button
          onClick={() => router.push(ROUTES.auth.login)}
          className="mt-2 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-wine text-white text-sm font-semibold hover:bg-brand-wine/90 transition-colors"
        >
          Ir al inicio de sesión
        </button>
      </div>
    )
  }

  const apiError = mutation.isError
    ? (mutation.error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ?? 'El enlace es inválido o ha expirado.'
    : null

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Nueva contraseña</h1>
        <p className="text-brand-silver text-sm mt-1">Elige una contraseña segura de al menos 8 caracteres.</p>
      </div>

      {apiError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-sm">Nueva contraseña</Label>
          <div className="relative">
            <Input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('new_password')}
              className="pr-10 bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-steel hover:text-brand-silver transition-colors">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.new_password && <p className="text-xs text-red-400">{errors.new_password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-brand-silver text-sm">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirm_password')}
              className="pr-10 bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-steel hover:text-brand-silver transition-colors">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
        >
          {mutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            : 'Guardar nueva contraseña'
          }
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
