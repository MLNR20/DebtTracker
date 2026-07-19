import type { Contact } from './contact'
import type { User } from './user'

export interface Debt {
  debt_id: string
  expense_id: string | null
  creditor_id: string
  debtor_user_id: string | null
  debtor_contact_id: string | null
  total_amount: string
  remaining_amount: string
  description: string | null
  due_date: string | null
  status: string
  date_created: string
  date_updated: string
  creditor?: User
  debtor_user?: User
  debtor_contact?: Contact
}
