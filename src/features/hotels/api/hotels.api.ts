import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { Hotel, HotelFilters } from '../types/hotel.types'

interface HotelsResponse {
  count: number
  hotels: Hotel[]
}

export const hotelsApi = {
  async list(filters: HotelFilters = {}): Promise<HotelsResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
    const { data } = await apiClient.get(API.hotels, { params })

    if ('results' in data) {
      const inner = data.results
      return { count: data.count, hotels: inner.hoteles ?? inner }
    }
    return { count: data.hoteles?.length ?? 0, hotels: data.hoteles ?? [] }
  },

  async get(id: number | string): Promise<Hotel> {
    const { data } = await apiClient.get(API.hotel(Number(id)))
    return data.hotel ?? data
  },

  async create(payload: FormData | Record<string, unknown>): Promise<Hotel> {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.post(API.hotels, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.hotel ?? data
  },

  async update(id: number, payload: FormData | Record<string, unknown>): Promise<Hotel> {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.patch(API.hotel(id), payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.hotel ?? data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API.hotel(id))
  },
}
