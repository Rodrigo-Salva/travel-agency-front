import { apiClient } from '@/lib/api/client'
import { API } from '@/lib/api/endpoints'
import type {
  LoginCredentials,
  LoginApiResponse,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '../types/auth.types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginApiResponse> => {
    const { data } = await apiClient.post<LoginApiResponse>(API.auth.login, credentials)
    return data
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post(API.auth.register, payload)
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get(API.auth.me)
    // Response: { exito: true, mensaje: "...", usuario: {...} }
    return data.usuario as User
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.patch(API.auth.updateProfile, payload)
    return data.usuario as User
  },
}
