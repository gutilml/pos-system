import { useAuthStore } from '@/store/useAuthStore'
import { normalizeLocale, type Locale } from '@/i18n/locale'
import { translate, type MessageKey } from '@/i18n/messages'

export function selectLocale(state: { user: { uiLocale?: string } | null }): Locale {
  return normalizeLocale(state.user?.uiLocale)
}

export function useT() {
  const locale = useAuthStore((s) => selectLocale(s))
  return (key: MessageKey) => translate(key, locale)
}

export function useLocale(): Locale {
  return useAuthStore((s) => selectLocale(s))
}
