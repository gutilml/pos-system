export type Locale = 'en' | 'es'

export function normalizeLocale(value: unknown): Locale {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase()
  return raw === 'es' ? 'es' : 'en'
}
