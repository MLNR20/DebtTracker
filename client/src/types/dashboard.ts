export interface DashboardSummary {
  total_pending_amount: number
  pending_debts_count: number
  overdue_count: number
  total_collected_amount: number
}

export interface DashboardChartPoint {
  month: string
  total_amount: number
  collected_amount: number
}
