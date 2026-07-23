/** Dispatched when the register should return keyboard focus to `#register-search`. */
export const REGISTER_SEARCH_FOCUS_EVENT = 'pos:register-search-focus'

export function requestRegisterSearchFocus(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(REGISTER_SEARCH_FOCUS_EVENT))
}

/** True when a blocking modal dialog is in the document. */
export function isRegisterModalOpen(): boolean {
  if (typeof document === 'undefined') return false
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))
}
