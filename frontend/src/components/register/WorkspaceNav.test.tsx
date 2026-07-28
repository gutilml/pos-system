import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WorkspaceNav } from '@/components/register/WorkspaceNav'
import { useAuthStore } from '@/store/useAuthStore'

function setLocale(uiLocale: 'en' | 'es') {
  useAuthStore.setState({
    user: {
      id: 'u1',
      username: 'cashier',
      role: 'CASHIER',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
      uiLocale,
    },
    status: 'authenticated',
    error: null,
  })
}

describe('WorkspaceNav', () => {
  it('always shows Inventory workspace button', () => {
    setLocale('en')
    render(<WorkspaceNav active="sell" onChange={() => {}} />)
    expect(screen.getByTestId('workspace-sell')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-products')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-customers')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-inventory')).toBeInTheDocument()
    expect(screen.queryByTestId('workspace-settings')).not.toBeInTheDocument()
  })

  it('notifies onChange when a workspace is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    setLocale('en')
    render(<WorkspaceNav active="sell" onChange={onChange} />)
    await user.click(screen.getByTestId('workspace-customers'))
    expect(onChange).toHaveBeenCalledWith('customers')
  })

  it('uses Spanish labels when locale is es', () => {
    setLocale('es')
    render(<WorkspaceNav active="sell" onChange={() => {}} />)
    expect(screen.getByTestId('workspace-sell')).toHaveTextContent('Caja')
    expect(screen.getByTestId('workspace-customers')).toHaveTextContent('Clientes')
    expect(screen.getByTestId('workspace-inventory')).toHaveTextContent('Inventario')
    expect(screen.queryByTestId('workspace-settings')).not.toBeInTheDocument()
  })
})
