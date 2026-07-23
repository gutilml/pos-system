import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '@/lib/money'
import { useCartStore } from '@/store/useCartStore'
import { isWebSerialSupported, requestScaleWeight } from '@/utils/serialScaleHelper'

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'] as const

/** Keep typed weight aligned with numpad rules: digits + at most one decimal point. */
export function sanitizeWeightInput(raw: string): string {
  let result = ''
  let seenDot = false
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') {
      if (result === '0' && ch !== '.') {
        result = ch
      } else {
        result += ch
      }
      continue
    }
    if (ch === '.' && !seenDot) {
      seenDot = true
      result = result === '' ? '0.' : `${result}.`
    }
  }
  return result
}

export function WeightModal() {
  const pending = useCartStore((s) => s.pendingWeightProduct)
  const confirmWeight = useCartStore((s) => s.confirmWeight)
  const clearPendingWeight = useCartStore((s) => s.clearPendingWeight)

  const [weightInput, setWeightInput] = useState('')
  const [scaleError, setScaleError] = useState<string | null>(null)
  const [readingScale, setReadingScale] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pending) {
      setWeightInput('')
      setScaleError(null)
      // Defer so the input exists after the modal mounts.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [pending])

  useEffect(() => {
    if (!pending) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        clearPendingWeight()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pending, clearPendingWeight])

  if (!pending) {
    return null
  }

  const unit = pending.unitOfMeasure ?? 'units'
  const parsedWeight = Number.parseFloat(weightInput)
  const canConfirm = Number.isFinite(parsedWeight) && parsedWeight > 0
  const estimatedTotal =
    canConfirm ? formatMoney(parsedWeight * pending.sellingPrice) : formatMoney(0)

  function appendKey(key: string) {
    setScaleError(null)
    if (key === '⌫') {
      setWeightInput((prev) => prev.slice(0, -1))
      return
    }
    if (key === '.') {
      setWeightInput((prev) => (prev.includes('.') ? prev : prev === '' ? '0.' : `${prev}.`))
      return
    }
    setWeightInput((prev) => {
      if (prev === '0' && key !== '.') return key
      return `${prev}${key}`
    })
  }

  function handleTypedChange(value: string) {
    setScaleError(null)
    setWeightInput(sanitizeWeightInput(value))
  }

  function handleConfirm() {
    if (!canConfirm) return
    confirmWeight(parsedWeight)
  }

  async function handleReadScale() {
    setScaleError(null)
    setReadingScale(true)
    try {
      const weight = await requestScaleWeight()
      setWeightInput(String(weight))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not read from scale'
      setScaleError(`${message}. Enter weight with the keyboard or numpad.`)
    } finally {
      setReadingScale(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weight-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="weight-modal-title" className="text-xl font-semibold text-slate-900">
            Enter weight
          </h2>
          <p className="mt-1 text-slate-600">{pending.name}</p>
          <p className="text-sm text-slate-500">
            Unit: <span className="font-medium text-slate-700">{unit}</span>
            {' · '}
            {formatMoney(pending.sellingPrice)} / {unit}
          </p>
        </div>

        <div className="px-5 py-4">
          <label htmlFor="weight-input" className="sr-only">
            Weight in {unit}
          </label>
          <div className="flex items-baseline gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
            <input
              ref={inputRef}
              id="weight-input"
              type="text"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => handleTypedChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) {
                  e.preventDefault()
                  handleConfirm()
                }
              }}
              placeholder="0.000"
              className="w-full bg-transparent text-3xl font-semibold tabular-nums text-slate-900 outline-none"
            />
            <span className="shrink-0 text-lg text-slate-500">{unit}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Line total: <span className="font-medium tabular-nums text-slate-800">{estimatedTotal}</span>
          </p>
          {scaleError ? (
            <p className="mt-2 text-sm text-amber-700" role="alert">
              {scaleError}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 pb-4">
          {NUMPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => appendKey(key)}
              className="flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white text-2xl font-medium text-slate-900 active:bg-slate-100"
              aria-label={key === '⌫' ? 'Backspace' : key === '.' ? 'Decimal point' : `Digit ${key}`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => void handleReadScale()}
            disabled={readingScale || !isWebSerialSupported()}
            className="rounded-xl border border-emerald-700 px-4 py-3 font-medium text-emerald-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 active:bg-emerald-50"
          >
            {readingScale ? 'Reading scale…' : 'Read from Scale'}
          </button>
          {!isWebSerialSupported() ? (
            <p className="text-xs text-slate-500">
              Web Serial not available — enter weight with the keyboard or numpad.
            </p>
          ) : null}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => clearPendingWeight()}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 active:bg-emerald-800"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
