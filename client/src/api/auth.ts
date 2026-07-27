import { api } from '../lib/api'
import type { AuthResponse, LoginPayload, RegisterPayload, ResetPasswordPayload } from '../types/auth'

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/register', payload)
  return data
}

export async function logout() {
  await api.post('/logout')
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await api.post<{ message: string }>('/reset-password', payload)
  return data
}
