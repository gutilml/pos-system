import { describe, expect, it } from 'vitest'
import { parseWeightFromBuffer } from '@/utils/serialScaleHelper'

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
