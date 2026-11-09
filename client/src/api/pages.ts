import { api } from '../lib/api'
import type { PaginatedResponse } from '../types/pagination'
import type { Page } from '../types/page'

export interface PageInput {
  page_key: string
  page_name: string
  page_path: string
  page_group: string | null
  sort_order: number
}

export function fetchPages(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Page>> {
  return api
    .get<PaginatedResponse<Page>>('/pages', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

/** The whole page catalogue, unpaginated (for role page-assignment). */
export function fetchAllPages(): Promise<Page[]> {
  return api.get<Page[]>('/pages', { params: { all: 1 } }).then((res) => res.data)
}

export function createPage(input: PageInput): Promise<Page> {
  return api.post<Page>('/pages', input).then((res) => res.data)
}

export function updatePage(pageId: string, input: PageInput): Promise<Page> {
  return api.put<Page>(`/pages/${pageId}`, input).then((res) => res.data)
}

export function deletePage(pageId: string): Promise<void> {
  return api.delete(`/pages/${pageId}`).then(() => undefined)
}
