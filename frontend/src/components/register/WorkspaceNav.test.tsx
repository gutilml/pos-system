import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WorkspaceNav } from '@/components/register/WorkspaceNav'
import { useAuthStore } from '@/store/useAuthStore'

function setLocale(uiLocale: 'en' | 'es', enableInventory?: boolean) {
  useAuthStore.setState({
    user: {
      id: 'u1',
      username: 'cashier',
      role: 'CASHIER',
      storeId: 'store-1',
      storeName: 'Demo',
      active: true,
      uiLocale,
      enableInventory,
    },
    status: 'authenticated',
    error: null,
  })
}

describe('WorkspaceNav', () => {
  it('hides Inventory when enableInventory is false', () => {
    setLocale('en', false)
    render(<WorkspaceNav active="sell" onChange={() => {}} showInventory={false} />)
    expect(screen.getByTestId('workspace-sell')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-products')).toBeInTheDocument()
    expect(screen.getByTestId('workspace-customers')).toBeInTheDocument()
    expect(screen.queryByTestId('workspace-inventory')).not.toBeInTheDocument()
  })

  it('shows Inventory when enableInventory is true', () => {
    setLocale('en', true)
    render(<WorkspaceNav active="sell" onChange={() => {}} showInventory />)
    expect(screen.getByTestId('workspace-inventory')).toBeInTheDocument()
  })

  it('notifies onChange when a workspace is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    setLocale('en', true)
    render(<WorkspaceNav active="sell" onChange={onChange} showInventory />)
    await user.click(screen.getByTestId('workspace-customers'))
    expect(onChange).toHaveBeenCalledWith('customers')
  })

  it('uses Spanish labels when locale is es', () => {
    setLocale('es', false)
    render(<WorkspaceNav active="sell" onChange={() => {}} showInventory={false} />)
    expect(screen.getByTestId('workspace-sell')).toHaveTextContent(/Vender|Caja/i)
  })
})
