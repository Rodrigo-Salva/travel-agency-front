export type ActivityType =
  | 'sightseeing'
  | 'adventure'
  | 'cultural'
  | 'shopping'
  | 'dining'
  | 'sports'
  | 'wellness'
  | 'entertainment'

export type DifficultyLevel = 'easy' | 'moderate' | 'difficult'

export interface Activity {
  id: number
  name: string
  destination: number
  activity_type: ActivityType
  description: string
  duration_hours: string
  difficulty_level: DifficultyLevel
  price_per_person: string
  max_group_size: number
  image: string | null
  is_active: boolean
  created_at: string
}

export interface ActivityFilters {
  destination?: number
  activity_type?: ActivityType
  difficulty_level?: DifficultyLevel
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}
