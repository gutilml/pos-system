import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createCheckoutSession, getTransactionStatus } from '@/api/paymentApi'
import { useCartStore } from '@/store/useCartStore'

export type PaymentUiState = 'LOADING' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'ERROR'

export const STRIPE_POLL_INTERVAL_MS = 3000
export const STRIPE_SUCCESS_DISMISS_MS = 2000

type StripePaymentModalProps = {
  open: boolean
  transactionId: string | null
  onClose: () => void
}

export function StripePaymentModal({ open, transactionId, onClose }: StripePaymentModalProps) {
  const closeTicket = useCartStore((s) => s.closeTicket)
  const activeTicketId = useCartStore((s) => s.activeTicketId)

  const [uiState, setUiState] = useState<PaymentUiState>('LOADING')
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedRef = useRef(false)
  const ticketIdRef = useRef(activeTicketId)
  const onCloseRef = useRef(onClose)
  const closeTicketRef = useRef(closeTicket)

  ticketIdRef.current = activeTicketId
  onCloseRef.current = onClose
  closeTicketRef.current = closeTicket

  function clearTimers() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }

  function resetLocalState() {
    completedRef.current = false
    setUiState('LOADING')
    setCheckoutUrl(null)
    setError(null)
  }

  function handleCancel() {
    clearTimers()
    resetLocalState()
    onCloseRef.current()
  }

  function finishSuccess() {
    closeTicketRef.current(ticketIdRef.current)
    clearTimers()
    resetLocalState()
    onCloseRef.current()
  }

  useEffect(() => {
    if (!open || !transactionId) {
      return
    }

    const txId = transactionId
    let cancelled = false
    resetLocalState()

    async function startSession() {
      try {
        const session = await createCheckoutSession(txId)
        if (cancelled) return
        setCheckoutUrl(session.checkoutUrl)
        setUiState('PAYMENT_PENDING')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to start card payment')
        setUiState('ERROR')
      }
    }

    void startSession()

    return () => {
      cancelled = true
      clearTimers()
    }
  }, [open, transactionId])

  useEffect(() => {
    if (!open || !transactionId || uiState !== 'PAYMENT_PENDING') {
      return
    }

    const txId = transactionId

    async function pollOnce() {
      if (completedRef.current) return
      try {
        const result = await getTransactionStatus(txId)
        if (result.status === 'COMPLETED') {
          completedRef.current = true
          if (pollRef.current !== null) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          setUiState('PAYMENT_SUCCESS')
          successTimerRef.current = setTimeout(() => {
            finishSuccess()
          }, STRIPE_SUCCESS_DISMISS_MS)
        }
      } catch {
        // Keep showing QR; transient poll failures are ignored.
      }
    }

    void pollOnce()
    pollRef.current = setInterval(() => {
      void pollOnce()
    }, STRIPE_POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current !== null) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [open, transactionId, uiState])

  if (!open || !transactionId) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stripe-payment-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="stripe-payment-title" className="text-xl font-semibold text-slate-900">
          Card Payment
        </h2>

        {uiState === 'LOADING' ? (
          <div className="mt-8 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-700" />
            <p className="text-sm font-medium text-slate-600">Starting Stripe checkout…</p>
          </div>
        ) : null}

        {uiState === 'PAYMENT_PENDING' && checkoutUrl ? (
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-center text-sm text-slate-600">
              Ask the customer to scan this QR code to pay on their phone.
            </p>
            <div
              className="rounded-xl border border-slate-200 bg-white p-3"
              data-testid="stripe-qr"
            >
              <QRCodeSVG value={checkoutUrl} size={220} includeMargin />
            </div>
            <p className="mt-3 text-xs text-slate-400">Waiting for payment…</p>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 active:bg-slate-100"
            >
              Cancel — Pay Cash Instead
            </button>
          </div>
        ) : null}

        {uiState === 'PAYMENT_SUCCESS' ? (
          <div
            className="mt-8 flex flex-col items-center gap-3"
            role="status"
            aria-live="polite"
            data-testid="payment-success"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
              ✓
            </div>
            <p className="text-lg font-semibold text-emerald-800">Payment successful</p>
            <p className="text-sm text-slate-500">Closing ticket…</p>
          </div>
        ) : null}

        {uiState === 'ERROR' ? (
          <div className="mt-6" role="alert">
            <p className="text-sm text-red-600">{error ?? 'Something went wrong'}</p>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700"
            >
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
