import type { Debt } from './debt'

export interface PaymentHistory {
  history_id: string
  payment_id: string
  debt_id: string
  paid_amount: string
  payment_type: string
  remarks: string | null
  remaining_amount: string
  created_at: string
  debt?: Debt
}
