import type { User } from './user'

export interface Contact {
  contact_id: string
  user_id: string
  first_name: string
  last_name: string
  email: string | null
  contact_no: string | null
  date_created: string
  date_updated: string
  user?: User
}
