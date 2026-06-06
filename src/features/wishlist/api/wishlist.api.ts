import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type { WishlistItem, WishlistResponse } from '../types/wishlist.types'

export const wishlistApi = {
  async list(): Promise<WishlistItem[]> {
    const { data } = await apiClient.get<WishlistResponse>(API.wishlist)
    return data.favoritos ?? []
  },

  async add(packageId: number): Promise<{ exito: boolean; mensaje: string }> {
    const { data } = await apiClient.post(API.wishlist, { package: packageId })
    return data
  },

  async remove(itemId: number): Promise<{ exito: boolean; mensaje: string }> {
    const { data } = await apiClient.delete(API.wishlistItem(itemId))
    return data
  },

  async isInWishlist(packageId: number): Promise<number | null> {
    // returns wishlist item id if found, null otherwise
    const items = await this.list()
    const found = items.find(i => i.package === packageId)
    return found ? found.id : null
  },
}
