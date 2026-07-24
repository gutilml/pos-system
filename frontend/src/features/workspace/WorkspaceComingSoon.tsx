import { useT } from '@/i18n/useT'

type WorkspaceComingSoonProps = {
  titleKey: 'workspace.products' | 'workspace.customers' | 'workspace.inventory'
  testId: string
}

export function WorkspaceComingSoon({ titleKey, testId }: WorkspaceComingSoonProps) {
  const t = useT()
  return (
    <section
      className="flex min-h-0 flex-1 flex-col items-center justify-center bg-white px-6 text-center"
      data-testid={testId}
      aria-label={t(titleKey)}
    >
      <h2 className="text-xl font-semibold text-slate-900">{t(titleKey)}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">{t('workspace.comingSoon')}</p>
    </section>
  )
}
