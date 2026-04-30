import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { Review, CreateReviewPayload } from '../types/review.types'

export const reviewsApi = {
  async listByPackage(packageId: number): Promise<Review[]> {
    const { data } = await apiClient.get(API.reviews, {
      params: { package: packageId },
    })
    if ('results' in data) {
      const inner = data.results
      return inner.resenas ?? inner
    }
    return data.resenas ?? []
  },

  async listGeneral(): Promise<Review[]> {
    const { data } = await apiClient.get(API.reviews, { params: { page_size: 50 } })
    if ('results' in data) {
      const inner = data.results
      return inner.resenas ?? inner
    }
    return data.resenas ?? []
  },

  async listMine(): Promise<Review[]> {
    const { data } = await apiClient.get(API.reviews, { params: { page_size: 100 } })
    if ('results' in data) {
      const inner = data.results
      return inner.resenas ?? inner
    }
    return data.resenas ?? []
  },

  async create(payload: CreateReviewPayload): Promise<Review> {
    const { data } = await apiClient.post(API.reviews, payload)
    return data.resena ?? data
  },
}
