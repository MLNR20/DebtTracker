import { api } from '../lib/api'
import type { PaymentHistory } from '../types/paymentHistory'
import type { PaginatedResponse } from '../types/pagination'

export function fetchPaymentHistories(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<PaymentHistory>> {
  return api
    .get<PaginatedResponse<PaymentHistory>>('/payment-histories', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}
