import { api } from '../lib/api'
import type { PaginatedResponse } from '../types/pagination'
import type { Role } from '../types/role'

export interface RoleInput {
  role_name: string
}

export function fetchRoles(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<Role>> {
  return api
    .get<PaginatedResponse<Role>>('/roles', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createRole(input: RoleInput): Promise<Role> {
  return api.post<Role>('/roles', input).then((res) => res.data)
}

export function updateRole(roleId: string, input: RoleInput): Promise<Role> {
  return api.put<Role>(`/roles/${roleId}`, input).then((res) => res.data)
}

export function deleteRole(roleId: string): Promise<void> {
  return api.delete(`/roles/${roleId}`).then(() => undefined)
}
