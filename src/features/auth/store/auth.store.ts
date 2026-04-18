'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserType } from '../types/auth.types'

export interface AuthUser {
  id: number
  username: string
  email: string
  nombre_completo: string
  tipo_usuario: UserType
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean

  setAuth: (user: AuthUser, access: string, refresh: string) => void
  clearAuth: () => void
  setFullUser: (user: User) => void
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, access, refresh) => {
        // Store tokens in sessionStorage
        if (typeof window !== 'undefined') {
          const { setTokens } = require('@/lib/api/client') as typeof import('@/lib/api/client')
          setTokens(access, refresh)
        }
        // Set cookies for middleware to read (non-sensitive: just presence + role)
        setCookie('ta_auth', '1', 7)
        setCookie('ta_user_type', user.tipo_usuario, 7)

        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          const { clearTokens } = require('@/lib/api/client') as typeof import('@/lib/api/client')
          clearTokens()
        }
        deleteCookie('ta_auth')
        deleteCookie('ta_user_type')
        set({ user: null, isAuthenticated: false })
      },

      setFullUser: (fullUser: User) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                username: fullUser.username,
                email: fullUser.email,
                nombre_completo: `${fullUser.first_name} ${fullUser.last_name}`.trim(),
                tipo_usuario: fullUser.user_type,
              }
            : null,
        }))
      },
    }),
    {
      name: 'ta-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
