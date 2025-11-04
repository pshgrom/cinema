import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Booking from '../pages/Booking.vue'

vi.mock('vue-router', async (orig) => {
  return {
    ...(await (orig as any)()),
    useRoute: () => ({ params: { sessionId: '10' } }),
    useRouter: () => ({ push: vi.fn(), currentRoute: { value: { fullPath: '/booking/10' } } }),
  }
})

vi.mock('../stores/auth', () => ({ useAuthStore: () => ({ isAuthenticated: true }) }))

vi.mock('../api/sessions', () => ({
  fetchSession: vi.fn().mockResolvedValue({
    id: '10',
    seats: { rows: 2, seatsPerRow: 3 },
    bookedSeats: [],
  }),
  bookSeats: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

describe('Booking', () => {
  it('allows selecting a seat and enables booking button', async () => {
    const wrapper = mount(Booking)
    await vi.tick()
    const seats = wrapper.findAll('.booking__seat')
    expect(seats.length).toBe(6)
    const bookBtn = () => wrapper.get('.booking__button')
    expect(bookBtn().attributes('disabled')).toBeDefined()
    await seats[0].trigger('click')
    expect(wrapper.text()).toContain('Выбрано мест: 1')
    expect(bookBtn().attributes('disabled')).toBeUndefined()
  })
})


