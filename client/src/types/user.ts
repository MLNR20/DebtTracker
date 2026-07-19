export interface User {
  user_id: string
  role_id: string | null
  first_name: string
  last_name: string
  email_address: string
  contact_no: string | null
  user_name: string
  is_active: boolean
  is_deleted: boolean
  date_created: string
  date_updated: string
  role?: { role_id: string; role_name: string }
}
