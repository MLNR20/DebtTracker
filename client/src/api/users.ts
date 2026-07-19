import { api } from '../lib/api'
import type { PaginatedResponse } from '../types/pagination'
import type { User } from '../types/user'

export interface UserInput {
  role_id?: string
  first_name: string
  last_name: string
  email_address: string
  contact_no?: string
  user_name: string
  password?: string
  is_active?: boolean
}

export function fetchUsers(params: {
  page: number
  perPage: number
  search: string
}): Promise<PaginatedResponse<User>> {
  return api
    .get<PaginatedResponse<User>>('/users', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
      },
    })
    .then((res) => res.data)
}

export function createUser(input: UserInput): Promise<User> {
  return api.post<User>('/users', input).then((res) => res.data)
}

export function updateUser(userId: string, input: UserInput): Promise<User> {
  return api.put<User>(`/users/${userId}`, input).then((res) => res.data)
}

export function deleteUser(userId: string): Promise<void> {
  return api.delete(`/users/${userId}`).then(() => undefined)
}
