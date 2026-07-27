import type { Group } from './group'
import type { User } from './user'

export interface GroupExpense {
  expense_id: string
  group_id: string
  paid_by_user_id: string
  total_amount: string
  description: string | null
  split_type: string
  date_incurred: string
  date_created: string
  group?: Group
  payer?: User
}
