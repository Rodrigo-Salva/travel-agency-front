'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/features/auth/api/auth.api'
import { ROUTES } from '@/lib/constants/routes'

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.forgotPassword(data.email),
    onSuccess: (_, variables) => {
      setSentEmail(variables.email)
      setSent(true)
    },
  })

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Revisa tu correo</h1>
        <p className="text-brand-silver text-sm leading-relaxed">
          Si <span className="text-white font-medium">{sentEmail}</span> está registrado,
          recibirás un enlace para restablecer tu contraseña en los próximos minutos.
        </p>
        <p className="text-brand-steel text-xs">
          El enlace expira en 30 minutos. Revisa también tu carpeta de spam.
        </p>
        <Link
          href={ROUTES.auth.login}
          className="inline-flex items-center gap-2 mt-4 text-brand-rose hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">¿Olvidaste tu contraseña?</h1>
        <p className="text-brand-silver text-sm mt-1">
          Ingresa tu email y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-brand-silver text-sm">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-steel" />
            <Input
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              {...register('email')}
              className="pl-9 bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-400 text-center">
            Ocurrió un error. Intenta de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-wine text-white font-semibold hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
        >
          {mutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            : 'Enviar enlace'
          }
        </button>
      </form>

      <p className="text-center text-sm text-brand-silver">
        <Link href={ROUTES.auth.login} className="flex items-center justify-center gap-1.5 text-brand-rose hover:text-white transition-colors font-medium">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
