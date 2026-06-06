export interface WishlistItem {
  id: number
  package: number
  package_name: string
  package_image: string | null
  package_destination: string
  package_price: string
  package_duration: string
  added_at: string
}

export interface WishlistResponse {
  exito: boolean
  mensaje: string
  favoritos: WishlistItem[]
}
