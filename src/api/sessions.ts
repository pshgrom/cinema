import { apiClient } from './client'
import type { MovieSession } from './types'

export async function fetchSession(sessionId: string): Promise<MovieSession> {
  const { data } = await apiClient.get<MovieSession>(`/movieSessions/${sessionId}`)
  return data
}

export async function bookSeats(
    sessionId: string | number,
    seats: Array<{ row: number; col: number }>
) {
  const payload = {
    seats: seats.map(s => ({
      rowNumber: s.row + 1,
      seatNumber: s.col + 1
    })),
  }
  return apiClient.post(`/movieSessions/${sessionId}/bookings`, payload)
}


