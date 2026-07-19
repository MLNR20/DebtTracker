import { api } from '../lib/api'
import type { Group } from '../types/group'
import type { PaginatedResponse } from '../types/pagination'

export interface GroupInput {
  group_name: string
  group_description?: string
  created_by: string
}

export function fetchGroups(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Group>> {
  return api
    .get<PaginatedResponse<Group>>('/groups', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createGroup(input: GroupInput): Promise<Group> {
  return api.post<Group>('/groups', input).then((res) => res.data)
}

export function updateGroup(groupId: string, input: GroupInput): Promise<Group> {
  return api.put<Group>(`/groups/${groupId}`, input).then((res) => res.data)
}

export function deleteGroup(groupId: string): Promise<void> {
  return api.delete(`/groups/${groupId}`).then(() => undefined)
}
