import { useEffect, useState, type FormEvent } from 'react'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryApi,
} from '@/api/categories'
import { useT } from '@/i18n/useT'

type CategoryPanelProps = {
  onChanged?: () => void
}

export function CategoryPanel({ onChanged }: CategoryPanelProps) {
  const t = useT()
  const [items, setItems] = useState<CategoryApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [marginPct, setMarginPct] = useState('30')
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      setItems(await listCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  function startCreate() {
    setEditingId(null)
    setName('')
    setMarginPct('30')
  }

  function startEdit(cat: CategoryApi) {
    setEditingId(cat.id)
    setName(cat.name)
    setMarginPct(String(Math.round(cat.targetMargin * 10000) / 100))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const margin = Number(marginPct) / 100
    if (!name.trim() || !Number.isFinite(margin) || margin < 0 || margin >= 1) {
      setError(t('admin.categoryInvalid'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = { name: name.trim(), targetMargin: margin }
      if (editingId) {
        await updateCategory(editingId, body)
      } else {
        await createCategory(body)
      }
      startCreate()
      await reload()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteCategory(id)
      if (editingId === id) startCreate()
      await reload()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.saveFailed'))
    }
  }

  return (
    <div className="space-y-4" data-testid="category-panel">
      {loading ? <p className="text-sm text-slate-600">{t('common.loading')}</p> : null}

      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200">
        {items.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-0"
          >
            <button
              type="button"
              onClick={() => startEdit(cat)}
              className="flex-1 text-left text-sm text-slate-800 hover:text-emerald-800"
            >
              {cat.name}{' '}
              <span className="text-slate-500">
                ({Math.round(cat.targetMargin * 10000) / 100}%)
              </span>
            </button>
            <button
              type="button"
              onClick={() => void handleDelete(cat.id)}
              className="text-xs font-medium text-red-700 hover:underline"
            >
              {t('admin.delete')}
            </button>
          </li>
        ))}
        {!loading && items.length === 0 ? (
          <li className="px-3 py-4 text-sm text-slate-500">{t('admin.noCategories')}</li>
        ) : null}
      </ul>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 rounded-lg border border-slate-200 p-3">
        <p className="text-sm font-semibold text-slate-800">
          {editingId ? t('admin.editCategory') : t('admin.newCategory')}
        </p>
        <label className="block text-sm font-medium text-slate-700">
          {t('admin.name')}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          {t('admin.marginPct')}
          <input
            value={marginPct}
            onChange={(e) => setMarginPct(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <div className="flex gap-2">
          {editingId ? (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {t('admin.newCategory')}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('admin.save')}
          </button>
        </div>
      </form>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
