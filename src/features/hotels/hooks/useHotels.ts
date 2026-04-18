'use client'

import { useQuery } from '@tanstack/react-query'
import { hotelsApi } from '../api/hotels.api'
import { queryKeys } from '@/lib/query/keys'
import type { HotelFilters } from '../types/hotel.types'

export function useHotels(filters: HotelFilters = {}) {
  return useQuery({
    queryKey: queryKeys.hotels.list(filters as Record<string, unknown>),
    queryFn: () => hotelsApi.list(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useHotel(id: number | string) {
  return useQuery({
    queryKey: queryKeys.hotels.detail(Number(id)),
    queryFn: () => hotelsApi.get(id),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(id),
  })
}
