import { api } from '../lib/api'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/register', payload)
  return data
}
