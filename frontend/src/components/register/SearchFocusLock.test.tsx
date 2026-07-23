import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { SearchBar } from '@/components/register/SearchBar'
import { WeightModal } from '@/components/register/WeightModal'
import { requestRegisterSearchFocus } from '@/lib/registerSearchFocus'
import { resetCartForTests, useCartStore } from '@/store/useCartStore'

const deliHam = {
  id: 'p-ham',
  sku: '2001',
  name: 'Deli Ham',
  sellingPrice: 0.0125,
  sellByWeight: true as const,
  unitOfMeasure: 'gr',
}

describe('register search focus lock', () => {
  beforeEach(() => {
    resetCartForTests()
  })

  it('returns focus to #register-search after the weight modal closes', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ pendingWeightProduct: deliHam })

    render(
      <>
        <SearchBar />
        <WeightModal />
      </>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    requestRegisterSearchFocus()
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText(/search or scan/i))
    })
  })

  it('keeps focus on search when requestRegisterSearchFocus fires with no modal', async () => {
    render(<SearchBar />)
    const search = screen.getByLabelText(/search or scan/i)
    search.blur()
    requestRegisterSearchFocus()
    await waitFor(() => {
      expect(document.activeElement).toBe(search)
    })
  })
})
