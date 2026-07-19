import { api } from '../lib/api'
import type { Debt } from '../types/debt'
import type { PaginatedResponse } from '../types/pagination'

export interface DebtInput {
  creditor_id: string
  debtor_user_id?: string
  debtor_contact_id?: string
  total_amount: number
  remaining_amount: number
  description?: string
  due_date?: string
  status: string
}

export function fetchDebts(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Debt>> {
  return api
    .get<PaginatedResponse<Debt>>('/debts', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createDebt(input: DebtInput): Promise<Debt> {
  return api.post<Debt>('/debts', input).then((res) => res.data)
}

export function updateDebt(debtId: string, input: DebtInput): Promise<Debt> {
  return api.put<Debt>(`/debts/${debtId}`, input).then((res) => res.data)
}

export function deleteDebt(debtId: string): Promise<void> {
  return api.delete(`/debts/${debtId}`).then(() => undefined)
}
