import { apiClient } from './client'
import type { Booking } from './types'

export async function fetchMyBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>('/me/bookings')
  return data
}

export async function payBooking(bookingId: string): Promise<{ status: 'ok' }>{
  const { data } = await apiClient.post<{ status: 'ok' }>(`/bookings/${bookingId}/payments`)
  return data
}


