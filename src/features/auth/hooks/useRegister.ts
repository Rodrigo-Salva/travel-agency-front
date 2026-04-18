'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { ROUTES } from '@/lib/constants/routes'
import type { RegisterPayload } from '../types/auth.types'

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      if (!data.exito) {
        toast.error(data.mensaje || 'Error al registrarse')
        return
      }
      toast.success('¡Cuenta creada! Ahora inicia sesion')
      router.push(ROUTES.auth.login)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { mensaje?: string } } }
      toast.error(err?.response?.data?.mensaje || 'Error al crear la cuenta')
    },
  })
}
