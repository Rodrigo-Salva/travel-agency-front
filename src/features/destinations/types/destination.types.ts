export type Continent =
  | 'Africa'
  | 'America'
  | 'Asia'
  | 'Europa'
  | 'Oceania'
  | 'Antartica'

export interface Destination {
  id: number
  name: string
  country: string
  continent: Continent
  description: string
  short_description: string
  latitude: number | null
  longitude: number | null
  image: string | null
  is_popular: boolean
  best_season: string
  created_at: string
}

export interface DestinationFilters {
  country?: string
  continent?: Continent
  is_popular?: boolean
  best_season?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}
