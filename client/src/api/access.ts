import { api } from '../lib/api'
import type { Access } from '../types/access'

export function fetchMyAccess(): Promise<Access> {
  return api.get<Access>('/me').then((res) => res.data)
}
