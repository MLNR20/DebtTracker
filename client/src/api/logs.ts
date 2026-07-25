import { api } from '../lib/api'
import type { Log } from '../types/log'
import type { PaginatedResponse } from '../types/pagination'

export function fetchLogs(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Log>> {
  return api
    .get<PaginatedResponse<Log>>('/logs', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}
