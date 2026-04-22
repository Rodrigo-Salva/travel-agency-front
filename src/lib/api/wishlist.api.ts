import { apiClient } from './client'
import { API } from './endpoints'

export interface WishlistItem {
  id: number
  package: number
  package_name: string
  package_image: string | null
  package_price: string
  package_destination: string
  package_duration: number
  created_at: string
}

export const wishlistApi = {
  async list(): Promise<WishlistItem[]> {
    const { data } = await apiClient.get(API.wishlist)
    if ('results' in data) return data.results ?? []
    return data.items ?? data ?? []
  },

  async add(packageId: number): Promise<WishlistItem> {
    const { data } = await apiClient.post(API.wishlist, { package: packageId })
    return data.item ?? data
  },

  async remove(itemId: number): Promise<void> {
    await apiClient.delete(API.wishlistItem(itemId))
  },

  async toggle(packageId: number, existingItemId?: number): Promise<{ added: boolean }> {
    if (existingItemId) {
      await wishlistApi.remove(existingItemId)
      return { added: false }
    }
    await wishlistApi.add(packageId)
    return { added: true }
  },
}
