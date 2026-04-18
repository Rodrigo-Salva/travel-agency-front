export interface Review {
  id: number
  customer_name: string
  overall_rating: number
  accommodation_rating: number | null
  transport_rating: number | null
  guide_rating: number | null
  value_rating: number | null
  average_rating: number
  title: string
  comment: string
  pros: string | null
  cons: string | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
}

export interface CreateReviewPayload {
  booking: number
  package: number
  overall_rating: number
  accommodation_rating?: number
  transport_rating?: number
  guide_rating?: number
  value_rating?: number
  title: string
  comment: string
  pros?: string
  cons?: string
}
