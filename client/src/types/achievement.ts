export interface Achievement {
  achievement_id: string
  user_id: string | null
  name: string
  description: string | null
  icon: string | null
  points: number
  date_created: string
  date_updated: string
}
