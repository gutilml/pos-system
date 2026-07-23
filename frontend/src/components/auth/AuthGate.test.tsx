import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthGate } from '@/components/auth/AuthGate'
import { useAuthStore } from '@/store/useAuthStore'

vi.mock('@/api/auth', () => ({
  fetchCsrf: vi.fn(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

import { fetchCsrf, fetchMe, login } from '@/api/auth'

describe('AuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'idle',
      error: null,
    })
  })

  it('shows loading while bootstrapping', () => {
    vi.mocked(fetchCsrf).mockImplementation(() => new Promise(() => undefined))
    render(
      <AuthGate>
        <div>Register</div>
      </AuthGate>,
    )
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
    expect(screen.queryByText('Register')).not.toBeInTheDocument()
  })

  it('shows login when unauthenticated', async () => {
    vi.mocked(fetchCsrf).mockResolvedValue('csrf')
    vi.mocked(fetchMe).mockRejectedValue(new Error('Unauthorized'))

    render(
      <AuthGate>
        <div>Register</div>
      </AuthGate>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })
    expect(screen.queryByText('Register')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    vi.mocked(fetchCsrf).mockResolvedValue('csrf')
    vi.mocked(fetchMe).mockResolvedValue({
      id: 'u1',
      username: 'admin',
      role: 'ADMIN',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
    })

    render(
      <AuthGate>
        <div>Register</div>
      </AuthGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument()
    })
  })

  it('logs in from the form and then shows children', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchCsrf).mockResolvedValue('csrf')
    vi.mocked(fetchMe).mockRejectedValue(new Error('Unauthorized'))
    vi.mocked(login).mockResolvedValue({
      id: 'u1',
      username: 'admin',
      role: 'ADMIN',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
    })

    render(
      <AuthGate>
        <div>Register</div>
      </AuthGate>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument()
    })
  })
})
