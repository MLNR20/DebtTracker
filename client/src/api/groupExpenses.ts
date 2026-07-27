import { api } from '../lib/api'
import type { GroupExpense } from '../types/groupExpense'
import type { PaginatedResponse } from '../types/pagination'

export interface GroupExpenseInput {
  group_id: string
  paid_by_user_id: string
  total_amount: number
  description?: string
  split_type: string
  date_incurred: string
}

export function fetchGroupExpenses(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<GroupExpense>> {
  return api
    .get<PaginatedResponse<GroupExpense>>('/group-expenses', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createGroupExpense(input: GroupExpenseInput): Promise<GroupExpense> {
  return api.post<GroupExpense>('/group-expenses', input).then((res) => res.data)
}

export function updateGroupExpense(
  expenseId: string,
  input: GroupExpenseInput,
): Promise<GroupExpense> {
  return api.put<GroupExpense>(`/group-expenses/${expenseId}`, input).then((res) => res.data)
}

export function deleteGroupExpense(expenseId: string): Promise<void> {
  return api.delete(`/group-expenses/${expenseId}`).then(() => undefined)
}
