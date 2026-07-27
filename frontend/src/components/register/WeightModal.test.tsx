import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WeightModal } from '@/components/register/WeightModal'
import { resetCartForTests, selectActiveItems, useCartStore } from '@/store/useCartStore'

vi.mock('@/utils/serialScaleHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/serialScaleHelper')>()
  return {
    ...actual,
    isWebSerialSupported: vi.fn(() => false),
    readScaleWeight: vi.fn(),
  }
})

import { isWebSerialSupported, MOCK_SCALE_STORAGE_KEY, readScaleWeight } from '@/utils/serialScaleHelper'

const deliHam = {
  id: 'p-ham',
  sku: '2001',
  name: 'Deli Ham',
  sellingPrice: 0.0125,
  sellByWeight: true as const,
  unitOfMeasure: 'gr',
}

describe('WeightModal', () => {
  beforeEach(() => {
    resetCartForTests()
    localStorage.removeItem(MOCK_SCALE_STORAGE_KEY)
    vi.mocked(isWebSerialSupported).mockReturnValue(false)
  })

  it('does not render when there is no pending weight product', () => {
    render(<WeightModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders product name and unit of measure when pending', () => {
    useCartStore.setState({ pendingWeightProduct: deliHam })
    render(<WeightModal />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Deli Ham')).toBeInTheDocument()
    expect(screen.getByText(/Unit:/)).toHaveTextContent('gr')
  })

  it('numpad entry confirms weight into the cart', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ pendingWeightProduct: deliHam })
    render(<WeightModal />)

    await user.click(screen.getByRole('button', { name: 'Digit 2' }))
    await user.click(screen.getByRole('button', { name: 'Digit 5' }))
    await user.click(screen.getByRole('button', { name: 'Digit 0' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    const state = useCartStore.getState()
    expect(state.pendingWeightProduct).toBeNull()
    const items = selectActiveItems(state)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(250)
  })

  it('keyboard entry enables Confirm and adds the weighted line', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ pendingWeightProduct: deliHam })
    render(<WeightModal />)

    const input = screen.getByLabelText(/weight in gr/i)
    expect(input).not.toHaveAttribute('readonly')
    await user.type(input, '12.5')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    const state = useCartStore.getState()
    expect(state.pendingWeightProduct).toBeNull()
    const items = selectActiveItems(state)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(12.5)
  })

  it('cancel clears pending weight without adding to cart', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ pendingWeightProduct: deliHam })
    render(<WeightModal />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    const state = useCartStore.getState()
    expect(state.pendingWeightProduct).toBeNull()
    expect(selectActiveItems(state)).toHaveLength(0)
  })
})

describe('WeightModal scale fallback', () => {
  beforeEach(() => {
    resetCartForTests({ pendingWeightProduct: deliHam })
    localStorage.removeItem(MOCK_SCALE_STORAGE_KEY)
    vi.mocked(isWebSerialSupported).mockReturnValue(false)
  })

  it('shows fallback messaging when Web Serial is unsupported', () => {
    render(<WeightModal />)

    expect(screen.getByText(/Web Serial not available/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read from Scale' })).toBeDisabled()
  })
})

describe('WeightModal auto-read', () => {
  beforeEach(() => {
    resetCartForTests({ pendingWeightProduct: deliHam })
    localStorage.removeItem(MOCK_SCALE_STORAGE_KEY)
    vi.mocked(isWebSerialSupported).mockReturnValue(true)
    vi.mocked(readScaleWeight).mockReset()
  })

  it('auto-fills weight from a granted scale without prompting', async () => {
    vi.mocked(readScaleWeight).mockResolvedValue(1.25)
    render(<WeightModal />)

    await waitFor(() => {
      expect(readScaleWeight).toHaveBeenCalledWith({ allowPrompt: false })
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/weight in gr/i)).toHaveValue('1.25')
    })
  })
})

describe('WeightModal mock scale', () => {
  beforeEach(() => {
    resetCartForTests({ pendingWeightProduct: deliHam })
    localStorage.setItem(MOCK_SCALE_STORAGE_KEY, '1')
    vi.mocked(isWebSerialSupported).mockReturnValue(false)
    vi.mocked(readScaleWeight).mockReset()
  })

  it('auto-fills fake weight without calling readScaleWeight', async () => {
    render(<WeightModal />)

    await waitFor(() => {
      expect(screen.getByLabelText(/weight in gr/i)).toHaveValue('1')
    })
    expect(readScaleWeight).not.toHaveBeenCalled()
    expect(screen.getByTestId('weight-mock-active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read from Scale' })).toBeEnabled()
  })

  it('Read from Scale fills the same fake weight', async () => {
    const user = userEvent.setup()
    render(<WeightModal />)

    await waitFor(() => {
      expect(screen.getByLabelText(/weight in gr/i)).toHaveValue('1')
    })
    await user.clear(screen.getByLabelText(/weight in gr/i))
    await user.click(screen.getByRole('button', { name: 'Read from Scale' }))
    expect(screen.getByLabelText(/weight in gr/i)).toHaveValue('1')
    expect(readScaleWeight).not.toHaveBeenCalled()
  })
})
