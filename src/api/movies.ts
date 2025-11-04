import { apiClient } from './client'
import type { Movie, MovieSession } from './types'

export async function fetchMovies(): Promise<Movie[]> {
  const { data } = await apiClient.get<Movie[]>('/movies')
  return data
}

export async function fetchMovieSessions(movieId: string): Promise<MovieSession[]> {
  const { data } = await apiClient.get<MovieSession[]>(`/movies/${movieId}/sessions`)
  return data
}


