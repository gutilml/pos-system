import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  parseWeightFromBuffer,
  readScaleWeight,
  ScaleConnectionError,
} from '@/utils/serialScaleHelper'

describe('parseWeightFromBuffer', () => {
  it('parses a plain decimal weight', () => {
    expect(parseWeightFromBuffer('0.250')).toBe(0.25)
  })

  it('parses weight embedded in a scale status string', () => {
    expect(parseWeightFromBuffer('ST,GS,  1.500 kg')).toBe(1.5)
  })

  it('returns null when no number is present', () => {
    expect(parseWeightFromBuffer('waiting')).toBeNull()
  })
})

describe('readScaleWeight', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reads from a granted port without prompting', async () => {
    const close = vi.fn().mockResolvedValue(undefined)
    const releaseLock = vi.fn()
    const read = vi
      .fn()
      .mockResolvedValueOnce({
        value: new TextEncoder().encode('0.500 kg'),
        done: false,
      })
      .mockResolvedValue({ done: true, value: undefined })

    const port = {
      open: vi.fn().mockResolvedValue(undefined),
      close,
      readable: {
        getReader: () => ({ read, releaseLock }),
      },
    }

    Object.defineProperty(navigator, 'serial', {
      configurable: true,
      value: {
        getPorts: vi.fn().mockResolvedValue([port]),
        requestPort: vi.fn(),
      },
    })

    const weight = await readScaleWeight({ allowPrompt: false, readMs: 200 })
    expect(weight).toBe(0.5)
    expect(navigator.serial!.requestPort).not.toHaveBeenCalled()
  })

  it('throws without prompt when no granted ports', async () => {
    Object.defineProperty(navigator, 'serial', {
      configurable: true,
      value: {
        getPorts: vi.fn().mockResolvedValue([]),
        requestPort: vi.fn(),
      },
    })

    await expect(readScaleWeight({ allowPrompt: false })).rejects.toBeInstanceOf(
      ScaleConnectionError,
    )
    expect(navigator.serial!.requestPort).not.toHaveBeenCalled()
  })
})
