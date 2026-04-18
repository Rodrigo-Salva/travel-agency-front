'use client'

import { useQuery } from '@tanstack/react-query'
import { activitiesApi } from '../api/activities.api'
import { queryKeys } from '@/lib/query/keys'
import type { ActivityFilters } from '../types/activity.types'

export function useActivities(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: queryKeys.activities.list(filters as Record<string, unknown>),
    queryFn: () => activitiesApi.list(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useActivity(id: number | string) {
  return useQuery({
    queryKey: queryKeys.activities.detail(Number(id)),
    queryFn: () => activitiesApi.get(id),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(id),
  })
}
