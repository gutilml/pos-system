import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/api/auth', () => ({
  fetchCsrf: vi.fn(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

import { login } from '@/api/auth'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'unauthenticated',
      error: null,
    })
  })

  it('selects existing username and password text on focus', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const username = screen.getByLabelText(/username/i)
    const password = screen.getByLabelText(/password/i)
    await user.type(username, 'cashier')
    await user.type(password, 'secret')

    username.blur()
    password.blur()

    await user.click(username)
    expect(username).toHaveProperty('selectionStart', 0)
    expect(username).toHaveProperty('selectionEnd', 'cashier'.length)

    await user.click(password)
    expect(password).toHaveProperty('selectionStart', 0)
    expect(password).toHaveProperty('selectionEnd', 'secret'.length)
  })

  it('submits values present in the form DOM on submit', async () => {
    vi.mocked(login).mockResolvedValue({
      id: 'u1',
      username: 'admin',
      role: 'ADMIN',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
    })

    render(<LoginForm />)

    const username = screen.getByLabelText(/username/i) as HTMLInputElement
    const password = screen.getByLabelText(/password/i) as HTMLInputElement
    // Autofill-style: set native value without going through React onChange handlers.
    fireEvent.change(username, { target: { value: 'admin' } })
    fireEvent.change(password, { target: { value: 'admin' } })

    fireEvent.submit(username.closest('form')!)

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin', 'admin')
    })
  })
})
