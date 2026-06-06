'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { wishlistApi } from '@/lib/api/wishlist.api'
import { queryKeys } from '@/lib/query/keys'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useWishlist() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: () => wishlistApi.list(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })
}

export function useWishlistToggle(packageId: number) {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const { data: items = [] } = useWishlist()

  const existing = items.find(i => i.package === packageId)
  const isWishlisted = !!existing

  const addMutation = useMutation({
    mutationFn: () => wishlistApi.add(packageId),
    onSuccess: () => {
      toast.success('Guardado en favoritos ❤️')
      qc.invalidateQueries({ queryKey: queryKeys.wishlist })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? 'No se pudo guardar')
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => wishlistApi.remove(existing!.id),
    onSuccess: () => {
      toast.success('Quitado de favoritos')
      qc.invalidateQueries({ queryKey: queryKeys.wishlist })
    },
    onError: () => toast.error('No se pudo quitar'),
  })

  function toggle() {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para guardar favoritos')
      return
    }
    if (isWishlisted) {
      removeMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }

  return {
    isWishlisted,
    toggle,
    isPending: addMutation.isPending || removeMutation.isPending,
  }
}
