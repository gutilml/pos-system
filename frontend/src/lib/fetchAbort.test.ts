import { describe, expect, it } from 'vitest'
import { isAbortError } from '@/lib/fetchAbort'

describe('isAbortError', () => {
  it('detects DOMException AbortError', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true)
  })

  it('detects message containing aborted', () => {
    expect(isAbortError(new Error('signal is aborted without reason'))).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isAbortError(new Error('Network failed'))).toBe(false)
  })
})
