import { apiClient, setAuthToken } from './client'
import type { AuthResponse } from './types'

export async function register(username: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/register', { username, password })
  setAuthToken(data.token)
  return data
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/login', { username, password })
  setAuthToken(data.token)
  return data
}

export function logout(): void {
  setAuthToken(null)
}
