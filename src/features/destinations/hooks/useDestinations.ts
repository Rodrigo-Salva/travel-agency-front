'use client'

import { useQuery } from '@tanstack/react-query'
import { destinationsApi } from '../api/destinations.api'
import { queryKeys } from '@/lib/query/keys'
import type { DestinationFilters } from '../types/destination.types'

export function useDestinations(filters: DestinationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.destinations.list(filters as Record<string, unknown>),
    queryFn: () => destinationsApi.list(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useDestination(id: number | string) {
  return useQuery({
    queryKey: queryKeys.destinations.detail(id),
    queryFn: () => destinationsApi.get(id),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(id),
  })
}
