'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../api/reviews.api'
import { queryKeys } from '@/lib/query/keys'
import type { CreateReviewPayload } from '../types/review.types'

export function useReviews(packageId: number) {
  return useQuery({
    queryKey: queryKeys.reviews.byPackage(packageId),
    queryFn: () => reviewsApi.listByPackage(packageId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(packageId),
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.reviews.byPackage(vars.package) })
    },
  })
}
