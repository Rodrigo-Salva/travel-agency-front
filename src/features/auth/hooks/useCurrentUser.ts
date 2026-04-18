'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { queryKeys } from '@/lib/query/keys'
import { getAccessToken } from '@/lib/api/client'

export function useCurrentUser() {
  const { isAuthenticated, setFullUser } = useAuthStore()
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken())

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const user = await authApi.me()
      setFullUser(user)
      return user
    },
    enabled: isAuthenticated || hasToken,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
