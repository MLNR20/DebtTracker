import { api } from '../lib/api'
import type { Payment } from '../types/payment'
import type { PaginatedResponse } from '../types/pagination'

export interface PaymentInput {
  debt_id: string
  paid_amount: number
  payment_type: string
  proof_img_url?: string
  remarks?: string
}

export function fetchPayments(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Payment>> {
  return api
    .get<PaginatedResponse<Payment>>('/payments', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createPayment(input: PaymentInput): Promise<Payment> {
  return api.post<Payment>('/payments', input).then((res) => res.data)
}

export function updatePayment(paymentId: string, input: PaymentInput): Promise<Payment> {
  return api.put<Payment>(`/payments/${paymentId}`, input).then((res) => res.data)
}

export function deletePayment(paymentId: string): Promise<void> {
  return api.delete(`/payments/${paymentId}`).then(() => undefined)
}
