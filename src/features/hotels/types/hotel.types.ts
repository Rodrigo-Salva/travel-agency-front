import type { Destination } from '@/features/destinations/types/destination.types'

export interface Hotel {
  id: number
  name: string
  destination: Destination
  address: string
  star_rating: number
  description: string | null
  amenities: string | null
  check_in_time: string | null
  check_out_time: string | null
  phone: string | null
  email: string | null
  price_per_night: string
  total_rooms: number
  image: string | null
  is_active: boolean
}

export interface HotelFilters {
  destination?: number
  star_rating?: number
  min_price?: number
  max_price?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}
