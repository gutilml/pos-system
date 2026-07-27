import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScaleConnectBanner } from '@/components/register/ScaleConnectBanner'
import { SCALE_BANNER_DISMISS_KEY, MOCK_SCALE_STORAGE_KEY } from '@/utils/serialScaleHelper'

vi.mock('@/utils/serialScaleHelper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/serialScaleHelper')>()
  return {
    ...actual,
    isWebSerialSupported: vi.fn(() => true),
    hasGrantedScalePort: vi.fn(),
    pairScalePort: vi.fn(),
  }
})

import { hasGrantedScalePort, pairScalePort } from '@/utils/serialScaleHelper'

describe('ScaleConnectBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    localStorage.removeItem(MOCK_SCALE_STORAGE_KEY)
  })

  it('shows connect CTA when unpaired', async () => {
    vi.mocked(hasGrantedScalePort).mockResolvedValue(false)
    render(<ScaleConnectBanner />)
    expect(await screen.findByTestId('scale-connect-banner')).toBeInTheDocument()
    expect(screen.getByTestId('scale-connect-button')).toHaveTextContent(/Connect scale/i)
  })

  it('hides when already paired', async () => {
    vi.mocked(hasGrantedScalePort).mockResolvedValue(true)
    render(<ScaleConnectBanner />)
    await waitFor(() => expect(hasGrantedScalePort).toHaveBeenCalled())
    expect(screen.queryByTestId('scale-connect-banner')).not.toBeInTheDocument()
  })

  it('suppresses register CTA when mock scale is on', async () => {
    localStorage.setItem(MOCK_SCALE_STORAGE_KEY, '1')
    vi.mocked(hasGrantedScalePort).mockResolvedValue(false)
    render(<ScaleConnectBanner />)
    expect(screen.queryByTestId('scale-connect-banner')).not.toBeInTheDocument()
  })

  it('still shows Settings connect panel when mock scale is on', async () => {
    localStorage.setItem(MOCK_SCALE_STORAGE_KEY, '1')
    vi.mocked(hasGrantedScalePort).mockResolvedValue(false)
    render(<ScaleConnectBanner alwaysShow />)
    expect(await screen.findByTestId('scale-connect-banner')).toBeInTheDocument()
  })

  it('dismisses for the session', async () => {
    const user = userEvent.setup()
    vi.mocked(hasGrantedScalePort).mockResolvedValue(false)
    render(<ScaleConnectBanner />)
    await screen.findByTestId('scale-connect-banner')
    await user.click(screen.getByTestId('scale-banner-dismiss'))
    expect(sessionStorage.getItem(SCALE_BANNER_DISMISS_KEY)).toBe('1')
    expect(screen.queryByTestId('scale-connect-banner')).not.toBeInTheDocument()
  })

  it('pairs on connect click', async () => {
    const user = userEvent.setup()
    vi.mocked(hasGrantedScalePort).mockResolvedValue(false)
    vi.mocked(pairScalePort).mockResolvedValue(undefined)
    render(<ScaleConnectBanner alwaysShow />)
    await screen.findByTestId('scale-connect-banner')
    await user.click(screen.getByTestId('scale-connect-button'))
    await waitFor(() => expect(pairScalePort).toHaveBeenCalled())
    expect(screen.getByText(/Scale connected/i)).toBeInTheDocument()
  })
})
