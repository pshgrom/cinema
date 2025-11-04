export type User = {
  id: string
  username: string
}

export type AuthResponse = {
  token: string
}

export type Movie = {
  id: string | number
  title: string
  lengthMinutes: number
  rating: number
  description: string
  posterImage: string
  year: number
}

export type Cinema = {
  id: string
  name: string
  address: string
}

export type MovieSession = {
  id: string
  cinemaId: string
  startTime: string
  seats: {
    rows: number
    cols: number
  }
  bookedSeats: Array<{ row: number; col: number }>
  price: number
}

export type Booking = {
  id: string
  userId: number
  movieSessionId: number
  seats: Array<{ rowNumber: number; seatNumber: number }>
  isPaid: boolean
  bookedAt: string
}

export type Settings = {
  paymentWindowSeconds: number
}


