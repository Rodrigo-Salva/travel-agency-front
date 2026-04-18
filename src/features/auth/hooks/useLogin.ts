'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { ROUTES } from '@/lib/constants/routes'
import type { LoginCredentials } from '../types/auth.types'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      if (!data.exito) {
        toast.error(data.mensaje || 'Error al iniciar sesion')
        return
      }

      setAuth(data.usuario, data.access, data.refresh)

      toast.success(data.mensaje || '¡Bienvenido!')

      // Role-based redirect
      if (data.usuario.tipo_usuario === 'admin') {
        router.push(ROUTES.admin.dashboard)
      } else {
        router.push(ROUTES.customer.dashboard)
      }
    },
    onError: () => {
      toast.error('Usuario o contraseña incorrectos')
    },
  })
}
