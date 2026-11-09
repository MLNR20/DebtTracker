import type { Page } from './page'

export interface Role {
  role_id: string
  role_name: string
  is_admin: boolean
  pages?: Page[]
  date_created: string
  date_updated: string
}
