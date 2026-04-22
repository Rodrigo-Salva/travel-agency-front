'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLogin } from '../hooks/useLogin'
import { ROUTES } from '@/lib/constants/routes'

const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contrasena es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, isError, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    // Limpiar cookies viejas para evitar redirect loop del middleware
    document.cookie = 'ta_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'ta_user_type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    login(data)
  }

  const errorMessage =
    isError
      ? (error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
        'Usuario o contrasena incorrectos'
      : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Bienvenido de vuelta</h1>
        <p className="text-brand-silver text-sm mt-1">Inicia sesion en tu cuenta</p>
      </div>

      {errorMessage && (
        <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-brand-silver text-sm">
          Usuario o email
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="tu_usuario"
          autoComplete="username"
          className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-brand-silver text-sm">
          Contrasena
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className="bg-brand-darkest/60 border-brand-steel/20 text-white placeholder:text-brand-steel focus:border-brand-wine pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-steel hover:text-brand-silver transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-wine hover:bg-brand-wine/90 text-white h-11 font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesion...
          </>
        ) : (
          'Iniciar Sesion'
        )}
      </Button>

      <p className="text-center text-sm text-brand-silver">
        ¿No tienes cuenta?{' '}
        <Link href={ROUTES.auth.register} className="text-brand-rose hover:text-white transition-colors font-medium">
          Registrate aqui
        </Link>
      </p>
    </form>
  )
}
