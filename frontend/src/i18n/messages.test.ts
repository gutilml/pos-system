import { describe, expect, it } from 'vitest'
import { normalizeLocale } from '@/i18n/locale'
import { translate } from '@/i18n/messages'

describe('i18n', () => {
  it('normalizes locale to en or es', () => {
    expect(normalizeLocale('es')).toBe('es')
    expect(normalizeLocale('ES')).toBe('es')
    expect(normalizeLocale('fr')).toBe('en')
    expect(normalizeLocale(undefined)).toBe('en')
  })

  it('translates keys with English fallback', () => {
    expect(translate('login.title', 'en')).toBe('Sign in')
    expect(translate('login.title', 'es')).toBe('Iniciar sesión')
    expect(translate('footer.pay', 'es')).toBe('Cobrar')
  })
})
