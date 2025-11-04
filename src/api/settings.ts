import { apiClient } from './client'
import type { Settings } from './types'

export async function fetchSettings(): Promise<Settings> {
  const { data } = await apiClient.get<Settings>('/settings')
  return data
}


