import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../components/AppHeader.vue'

vi.mock('../stores/auth', () => {
  const state = { isAuthenticated: false, logout: vi.fn() }
  return {
    useAuthStore: () => state,
    __state: state,
  }
})

const push = vi.fn()
vi.mock('vue-router', async (orig) => {
  return {
    ...(await (orig as any)()),
    useRouter: () => ({ push }),
  }
})

describe('AppHeader', () => {
  beforeEach(() => {
    push.mockReset()
  })

  it('shows auth links when not authenticated', () => {
    const wrapper = mount(AppHeader, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
    expect(wrapper.findAll('.nav__link').map(n => n.text())).toContain('Регистрация')
    expect(wrapper.findAll('.nav__link').map(n => n.text())).toContain('Вход')
  })

  it('shows logout when authenticated and triggers logout on click', async () => {
    const { __state } = await import('../stores/auth') as any
    __state.isAuthenticated = true
    const wrapper = mount(AppHeader)
    const btn = wrapper.get('button.nav__link--secondary')
    await btn.trigger('click')
    expect(__state.logout).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'movies' })
    __state.isAuthenticated = false
  })
})


