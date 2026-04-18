export interface Category {
  id: number
  name: string
  description: string
  icon: string
}

export interface ItineraryDay {
  id: number
  day_number: number
  title: string
  description: string
  activities: string[]
  meals_included: string[]
}

export interface PackageSummary {
  id: number
  name: string
  slug: string
  category_name: string
  destination_name: string
  short_description: string
  duration_days: number
  duration_nights: number
  price_adult: string   // Django Decimal comes as string
  price_child: string
  image: string | null
  is_featured: boolean
  created_at: string
}

export interface PackageDetail {
  id: number
  name: string
  slug: string
  category: Category
  destination: string
  description: string
  short_description: string
  duration_days: number
  duration_nights: number
  total_duration: string
  price_adult: string
  price_child: string
  max_people: number
  min_people: number
  includes_flight: boolean
  includes_hotel: boolean
  includes_meals: boolean
  includes_transport: boolean
  includes_guide: boolean
  image: string | null
  is_active: boolean
  is_featured: boolean
  available_from: string
  available_until: string
  itinerary: ItineraryDay[]
  created_at: string
  updated_at: string
}

export interface PackageFilters {
  category?: number
  destination?: number
  is_featured?: boolean
  is_active?: boolean
  min_price?: number
  max_price?: number
  min_days?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}
