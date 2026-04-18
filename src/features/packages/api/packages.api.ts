import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { Category, PackageSummary, PackageDetail, PackageFilters } from '../types/package.types'

function buildParams(filters: PackageFilters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.category) params.category = String(filters.category)
  if (filters.destination) params.destination = String(filters.destination)
  if (filters.is_featured !== undefined) params.is_featured = String(filters.is_featured)
  if (filters.is_active !== undefined) params.is_active = String(filters.is_active)
  if (filters.min_price) params.min_price = String(filters.min_price)
  if (filters.max_price) params.max_price = String(filters.max_price)
  if (filters.min_days) params.min_days = String(filters.min_days)
  if (filters.search) params.search = filters.search
  if (filters.ordering) params.ordering = filters.ordering
  if (filters.page) params.page = String(filters.page)
  if (filters.page_size) params.page_size = String(filters.page_size)
  return params
}

export const packagesApi = {
  list: async (filters: PackageFilters = {}) => {
    const { data } = await apiClient.get(API.packages, { params: buildParams(filters) })
    if ('results' in data) {
      const inner = data.results
      return {
        count: data.count as number,
        next: data.next as string | null,
        previous: data.previous as string | null,
        packages: (inner?.paquetes ?? inner) as PackageSummary[],
      }
    }
    return {
      count: (data.paquetes as PackageSummary[]).length,
      next: null,
      previous: null,
      packages: data.paquetes as PackageSummary[],
    }
  },

  get: async (id: number | string): Promise<PackageDetail> => {
    const { data } = await apiClient.get(API.package(id))
    return data.paquete as PackageDetail
  },

  listCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get(API.categories)
    return data.categorias as Category[]
  },

  create: async (payload: Record<string, unknown>): Promise<PackageDetail> => {
    const { data } = await apiClient.post(API.packages, payload)
    return data.paquete as PackageDetail
  },

  update: async (id: number, payload: Record<string, unknown>): Promise<PackageDetail> => {
    const { data } = await apiClient.patch(API.package(id), payload)
    return data.paquete as PackageDetail
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API.package(id))
  },
}
