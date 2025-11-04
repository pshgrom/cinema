import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Movies from '../pages/Movies.vue'

vi.mock('../api/movies', () => ({
  fetchMovies: vi.fn().mockResolvedValue([
    { id: '1', title: 'A', lengthMinutes: 95, rating: 8.1, posterImage: '/p1.jpg' },
    { id: '2', title: 'B', lengthMinutes: 120, rating: 7.5, posterImage: '/p2.jpg' },
  ]),
}))

vi.mock('../api/client', () => ({ API_BASE_URL: 'https://api.test' }))

const push = vi.fn()
vi.mock('vue-router', async (orig) => {
  return {
    ...(await (orig as any)()),
    useRouter: () => ({ push }),
  }
})

describe('Movies', () => {
  it('renders movies grid and routes on card click', async () => {
    const wrapper = mount(Movies)
    await flushPromises()
    const cards = wrapper.findAll('.movie-card')
    expect(cards.length).toBe(2)
    await cards[0]!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'movie-details', params: { id: '1' } })
  })
})


