import { api } from '../lib/api'
import type { DashboardChartPoint, DashboardSummary } from '../types/dashboard'
import type { Debt } from '../types/debt'
import type { PaginatedResponse } from '../types/pagination'

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>('/dashboard/summary').then((res) => res.data)
}

export function fetchDashboardChart(months = 6): Promise<DashboardChartPoint[]> {
  return api
    .get<DashboardChartPoint[]>('/dashboard/chart', { params: { months } })
    .then((res) => res.data)
}

export function fetchPendingDebts(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Debt>> {
  return api
    .get<PaginatedResponse<Debt>>('/dashboard/pending', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}
