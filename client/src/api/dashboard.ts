import { api } from '../lib/api'
import type { DashboardChartPoint, DashboardSummary } from '../types/dashboard'
import type { Debt } from '../types/debt'

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>('/dashboard/summary').then((res) => res.data)
}

export function fetchDashboardChart(months = 6): Promise<DashboardChartPoint[]> {
  return api
    .get<DashboardChartPoint[]>('/dashboard/chart', { params: { months } })
    .then((res) => res.data)
}

export function fetchPendingDebts(limit = 10): Promise<Debt[]> {
  return api
    .get<Debt[]>('/dashboard/pending', { params: { limit } })
    .then((res) => res.data)
}
