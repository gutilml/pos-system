/** True when a fetch was cancelled via AbortController (React cleanup, stale typeahead). */
export function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  if (err instanceof Error && /aborted/i.test(err.message)) return true
  return false
}
