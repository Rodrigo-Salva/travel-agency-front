export type UserType = 'admin' | 'customer'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  nationality: string | null
  passport_number: string | null
  user_type: UserType
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login: string | null
  date_joined: string
  created_at: string
  updated_at: string
}

// The login response from Django uses Spanish keys
export interface LoginApiResponse {
  exito: boolean
  mensaje: string
  access: string
  refresh: string
  usuario: {
    id: number
    username: string
    email: string
    nombre_completo: string
    tipo_usuario: UserType
  }
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  phone?: string
  nationality?: string
  passport_number?: string
  address?: string
  city?: string
  country?: string
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  passport_number?: string
}
