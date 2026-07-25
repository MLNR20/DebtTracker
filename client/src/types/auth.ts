export interface AuthUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
  user_name: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
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

export interface ForgotPasswordPayload {
  email_address: string
}

export interface ResetPasswordPayload {
  token: string
  email_address: string
  password: string
  password_confirmation: string
}
