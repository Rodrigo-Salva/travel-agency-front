import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { Activity, ActivityFilters } from '../types/activity.types'

interface ActivitiesResponse {
  count: number
  activities: Activity[]
}

export const activitiesApi = {
  async list(filters: ActivityFilters = {}): Promise<ActivitiesResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
    const { data } = await apiClient.get(API.activities, { params })

    if ('results' in data) {
      const inner = data.results
      return { count: data.count, activities: inner.actividades ?? inner }
    }
    return { count: data.actividades?.length ?? 0, activities: data.actividades ?? [] }
  },

  async get(id: number | string): Promise<Activity> {
    const { data } = await apiClient.get(API.activity(Number(id)))
    return data.actividad ?? data
  },

  async create(payload: FormData | Record<string, unknown>): Promise<Activity> {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.post(API.activities, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.actividad ?? data
  },

  async update(id: number, payload: FormData | Record<string, unknown>): Promise<Activity> {
    const isFormData = payload instanceof FormData
    const { data } = await apiClient.patch(API.activity(id), payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return data.actividad ?? data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API.activity(id))
  },
}
