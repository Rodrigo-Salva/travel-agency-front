'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRegister } from '../hooks/useRegister'
import { ROUTES } from '@/lib/constants/routes'

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Minimo 2 caracteres'),
    last_name: z.string().min(2, 'Minimo 2 caracteres'),
    username: z.string().min(3, 'Minimo 3 caracteres'),
    email: z.string().email('Email invalido'),
    password: z.string().min(8, 'Minimo 8 caracteres'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contrasenas no coinciden',
    path: ['password_confirm'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { mutate: register, isPending, isError, error } = useRegister()

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => register(data)

  const apiErrors =
    isError
      ? (error as { response?: { data?: { errores?: Record<string, string[]>; mensaje?: string } } })?.response?.data
      : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="text-brand-silver text-sm mt-1">Unete y comienza a explorar</p>
      </div>

      {apiErrors?.mensaje && (
        <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
          <AlertDescription>{apiErrors.mensaje}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className="text-brand-silver text-sm">Nombre</Label>
          <Input
            id="first_name"
            placeholder="Juan"
            className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            {...formRegister('first_name')}
          />
          {errors.first_name && <p className="text-xs text-red-400">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name" className="text-brand-silver text-sm">Apellido</Label>
          <Input
            id="last_name"
            placeholder="Perez"
            className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
            {...formRegister('last_name')}
          />
          {errors.last_name && <p className="text-xs text-red-400">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-brand-silver text-sm">Usuario</Label>
        <Input
          id="username"
          placeholder="juanperez"
          autoComplete="username"
          className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          {...formRegister('username')}
        />
        {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
        {apiErrors?.errores?.username && <p className="text-xs text-red-400">{apiErrors.errores.username[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-brand-silver text-sm">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="juan@ejemplo.com"
          autoComplete="email"
          className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          {...formRegister('email')}
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        {apiErrors?.errores?.email && <p className="text-xs text-red-400">{apiErrors.errores.email[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-brand-silver text-sm">Contrasena</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimo 8 caracteres"
          autoComplete="new-password"
          className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          {...formRegister('password')}
        />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password_confirm" className="text-brand-silver text-sm">Confirmar contrasena</Label>
        <Input
          id="password_confirm"
          type="password"
          placeholder="Repite tu contrasena"
          autoComplete="new-password"
          className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          {...formRegister('password_confirm')}
        />
        {errors.password_confirm && <p className="text-xs text-red-400">{errors.password_confirm.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-wine hover:bg-brand-wine/90 text-white h-11 font-semibold mt-2"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear Cuenta'
        )}
      </Button>

      <p className="text-center text-sm text-brand-silver">
        ¿Ya tienes cuenta?{' '}
        <Link href={ROUTES.auth.login} className="text-brand-rose hover:text-white transition-colors font-medium">
          Inicia sesion
        </Link>
      </p>
    </form>
  )
}
