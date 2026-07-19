import type { User } from './user'

export interface Group {
  group_id: string
  group_name: string
  group_description: string | null
  created_by: string
  date_created: string
  date_updated: string
  creator?: User
}
