import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { mount } from '@vue/test-utils'
import Component from '@/components/Component'

jest.mock('axios')

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  test('renders correctly', () => {
    const wrapper = mount(Component)
    expect(wrapper.element).toMatchSnapshot()
  })

  it('fetches async when a button is clicked', async () => {
    const wrapper = shallowMount(Component)
    wrapper.find('button').trigger('click')

    await flushPromises();

    expect(wrapper.vm.value).toBe('value')
  })
})
