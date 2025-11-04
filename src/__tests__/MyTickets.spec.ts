import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyTickets from '../pages/MyTickets.vue'

vi.useFakeTimers()

vi.mock('../api/bookings', () => ({
  fetchMyBookings: vi.fn().mockResolvedValue([
    { id: 'u1', isPaid: false, bookedAt: new Date(Date.now() - 1000).toISOString(), movieSessionId: 1, seats: [{ rowNumber: 1, seatNumber: 1 }] },
    { id: 'p1', isPaid: true, bookedAt: new Date().toISOString(), movieSessionId: 2, seats: [{ rowNumber: 2, seatNumber: 3 }] },
  ]),
  payBooking: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

vi.mock('../api/settings', () => ({
  fetchSettings: vi.fn().mockResolvedValue({ paymentWindowSeconds: 600 }),
}))

vi.mock('../api/sessions', () => ({
  fetchSession: vi.fn().mockResolvedValueOnce({ id: 1, startTime: new Date(Date.now() + 3600_000).toISOString() })
                           .mockResolvedValueOnce({ id: 2, startTime: new Date(Date.now() + 7200_000).toISOString() }),
}))

describe('MyTickets', () => {
  it('groups tickets and shows sections', async () => {
    const wrapper = mount(MyTickets)
    await vi.tick()
    expect(wrapper.text()).toContain('Неоплаченные')
    expect(wrapper.text()).toContain('Будущие')
    const unpaid = wrapper.findAll('.ticket.ticket--unpaid')
    const paid = wrapper.findAll('.ticket.ticket--paid')
    expect(unpaid.length).toBe(1)
    expect(paid.length).toBe(1)
  })
})


