import type { Access } from './access'

export interface AuthUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
  user_name: string
}

export interface AuthResponse {
  user: AuthUser
  access: Access
  token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginPayload {
  login: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email_address: string
  user_name: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordPayload {
  email_address: string
  password: string
  password_confirmation: string
}
