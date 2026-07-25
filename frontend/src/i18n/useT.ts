import { useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { normalizeLocale, type Locale } from '@/i18n/locale'
import { translate, type MessageKey } from '@/i18n/messages'

export function selectLocale(state: { user: { uiLocale?: string } | null }): Locale {
  return normalizeLocale(state.user?.uiLocale)
}

/**
 * Stable translator for the current store locale (Feature 064).
 * Identity only changes when locale changes — safe in useCallback / useEffect deps.
 */
export function useT() {
  const locale = useAuthStore((s) => selectLocale(s))
  return useCallback((key: MessageKey) => translate(key, locale), [locale])
}

export function useLocale(): Locale {
  return useAuthStore((s) => selectLocale(s))
}
