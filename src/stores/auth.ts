import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth'
import type { User } from '../api/types'

type AuthState = {
  user: User | null
  token: string | null
  error: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    error: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const { token } = await apiLogin(username, password)
        this.token = token
      } catch (e) {
        this.error = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
        throw e
      } finally {
        this.loading = false
      }
    },
    async register(username: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const { token} = await apiRegister(username, password)
        this.token = token
      } finally {
        this.loading = false
      }
    },
    logout() {
      apiLogout()
      // this.user = null
      this.token = null
      this.error = null
    },
  },
})


