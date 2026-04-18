'use client'

import { useQuery } from '@tanstack/react-query'
import { packagesApi } from '../api/packages.api'
import { queryKeys } from '@/lib/query/keys'
import type { PackageFilters } from '../types/package.types'

export function usePackages(filters: PackageFilters = {}) {
  return useQuery({
    queryKey: queryKeys.packages.list(filters as Record<string, unknown>),
    queryFn: () => packagesApi.list(filters),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function usePackage(id: number | string) {
  return useQuery({
    queryKey: queryKeys.packages.detail(id),
    queryFn: () => packagesApi.get(id),
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(id),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.packages.categories,
    queryFn: () => packagesApi.listCategories(),
    staleTime: 30 * 60 * 1000,
  })
}
