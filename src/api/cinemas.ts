import { apiClient } from './client'
import type { Cinema, MovieSession } from './types'

export async function fetchCinemas(): Promise<Cinema[]> {
  const { data } = await apiClient.get<Cinema[]>('/cinemas')
  return data
}

export async function fetchCinemaSessions(cinemaId: string): Promise<MovieSession[]> {
  const { data } = await apiClient.get<MovieSession[]>(`/cinemas/${cinemaId}/sessions`)
  return data
}


