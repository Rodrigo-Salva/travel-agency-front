import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { Destination, DestinationFilters } from '../types/destination.types'

function buildParams(filters: DestinationFilters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.country) params.country = filters.country
  if (filters.continent) params.continent = filters.continent
  if (filters.is_popular !== undefined) params.is_popular = String(filters.is_popular)
  if (filters.best_season) params.best_season = filters.best_season
  if (filters.search) params.search = filters.search
  if (filters.ordering) params.ordering = filters.ordering
  if (filters.page) params.page = String(filters.page)
  if (filters.page_size) params.page_size = String(filters.page_size)
  return params
}

export const destinationsApi = {
  list: async (filters: DestinationFilters = {}) => {
    const { data } = await apiClient.get(API.destinations, { params: buildParams(filters) })
    // Paginated: { count, next, previous, results: { exito, destinos: [...] } }
    // or flat: { exito, destinos: [...] }
    if ('results' in data) {
      const inner = data.results
      return {
        count: data.count as number,
        next: data.next as string | null,
        previous: data.previous as string | null,
        destinations: (inner?.destinos ?? inner) as Destination[],
      }
    }
    return {
      count: (data.destinos as Destination[]).length,
      next: null,
      previous: null,
      destinations: data.destinos as Destination[],
    }
  },

  get: async (id: number | string): Promise<Destination> => {
    const { data } = await apiClient.get(API.destination(id))
    return data.destino as Destination
  },

  create: async (payload: FormData | Partial<Destination>): Promise<Destination> => {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.post(API.destinations, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.destino as Destination
  },

  update: async (id: number, payload: FormData | Partial<Destination>): Promise<Destination> => {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.patch(API.destination(id), payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.destino as Destination
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API.destination(id))
  },
}
