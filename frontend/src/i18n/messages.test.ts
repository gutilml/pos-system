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
    expect(translate('cart.stock', 'en')).toBe('Inv')
    expect(translate('cart.stock', 'es')).toBe('Inv')
    expect(translate('tickets.new', 'es')).toBe('+ Ticket nuevo')
    expect(translate('customer.find', 'es')).toBe('Buscar cliente')
    expect(translate('checkout.creditGate', 'es')).toMatch(/crédito/i)
    expect(translate('shift.closeTitle', 'es')).toMatch(/Cerrar turno/i)
    expect(translate('tender.cash', 'es')).toBe('EFECTIVO')
    expect(translate('cashier.catalog', 'es')).toMatch(/Productos/i)
    expect(translate('admin.title', 'en')).toBe('Catalog')
  })
})
