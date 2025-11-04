import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders root container', () => {
    const wrapper = mount(App, { global: { stubs: { RouterView: true, AppHeader: true } } })
    expect(wrapper.find('.app').exists()).toBe(true)
  })
})
