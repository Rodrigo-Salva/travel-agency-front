'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { authApi } from '@/features/auth/api/auth.api'
import { getAccessToken, getRefreshToken, clearTokens } from '@/lib/api/client'

/**
 * Hydrates the auth store on page load/refresh.
 * If we have a refresh token but no user in the store, re-fetches /me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, setFullUser, clearAuth } = useAuthStore()

  useEffect(() => {
    const refresh = getRefreshToken()
    const access = getAccessToken()

    if (!refresh) return

    // If we have tokens but no auth state (e.g. after hard refresh)
    if (!isAuthenticated && access) {
      authApi.me()
        .then((user) => {
          setFullUser(user)
        })
        .catch(() => {
          clearAuth()
        })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
