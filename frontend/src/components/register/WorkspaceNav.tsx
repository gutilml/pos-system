import { useT } from '@/i18n/useT'
import type { WorkspaceId } from '@/features/workspace/workspaceIds'

type WorkspaceNavProps = {
  active: WorkspaceId
  onChange: (workspace: WorkspaceId) => void
  /** @deprecated Feature 063 — Inventory nav is always shown (read-only when flag off). */
  showInventory?: boolean
}

export function WorkspaceNav({ active, onChange }: WorkspaceNavProps) {
  const t = useT()

  const items: { id: WorkspaceId; label: string; testId: string }[] = [
    { id: 'sell', label: t('workspace.sell'), testId: 'workspace-sell' },
    { id: 'products', label: t('workspace.products'), testId: 'workspace-products' },
    { id: 'customers', label: t('workspace.customers'), testId: 'workspace-customers' },
    { id: 'inventory', label: t('workspace.inventory'), testId: 'workspace-inventory' },
    { id: 'settings', label: t('workspace.settings'), testId: 'workspace-settings' },
  ]

  return (
    <nav
      className="flex shrink-0 gap-1 border-b border-slate-300 bg-slate-800 px-2 py-1.5"
      aria-label={t('workspace.navAria')}
      data-testid="workspace-nav"
    >
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            data-testid={item.testId}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(item.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              isActive
                ? 'bg-white text-slate-900'
                : 'text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
