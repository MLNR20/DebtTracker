import type { Debt } from './debt'

export interface Payment {
  payment_id: string
  debt_id: string
  paid_amount: string
  payment_type: string
  proof_img_url: string | null
  remarks: string | null
  created_at: string
  updated_at: string
  debt?: Debt
}
