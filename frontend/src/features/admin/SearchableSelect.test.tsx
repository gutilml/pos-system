import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchableSelect } from '@/features/admin/SearchableSelect'

describe('SearchableSelect', () => {
  it('closes the menu on Escape without changing the selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SearchableSelect
        label="Parent"
        value="p1"
        options={[
          { id: 'p1', label: 'Parent A' },
          { id: 'p2', label: 'Parent B' },
        ]}
        noneLabel="None"
        searchPlaceholder="Search"
        testId="product-parent"
        onChange={onChange}
      />,
    )

    await user.click(screen.getByTestId('product-parent'))
    expect(screen.getByTestId('product-parent-menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByTestId('product-parent-menu')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('product-parent')).toHaveTextContent('Parent A')
  })
})
