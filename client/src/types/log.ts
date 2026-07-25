import type { User } from './user'

export interface Log {
  logs_id: string
  user_id: string
  logs_type: string
  logs_details: string | null
  date_created: string
  date_updated: string
  user?: User
}
