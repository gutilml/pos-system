import {
  selectActiveAmountReceived,
  selectActiveItems,
  useCartStore,
} from '@/store/useCartStore'

export function TicketTabs() {
  const ticketOrder = useCartStore((s) => s.ticketOrder)
  const tickets = useCartStore((s) => s.tickets)
  const activeTicketId = useCartStore((s) => s.activeTicketId)
  const createNewTicket = useCartStore((s) => s.createNewTicket)
  const switchTicket = useCartStore((s) => s.switchTicket)
  const closeTicket = useCartStore((s) => s.closeTicket)

  return (
    <div
      className="flex shrink-0 items-stretch gap-1 overflow-x-auto border-b border-slate-200 bg-slate-200/80 px-2 pt-2"
      role="tablist"
      aria-label="Open tickets"
    >
      {ticketOrder.map((id) => {
        const ticket = tickets[id]
        if (!ticket) return null
        const isActive = id === activeTicketId
        const itemCount = ticket.items.length

        return (
          <div
            key={id}
            className={`group flex max-w-[11rem] shrink-0 items-center rounded-t-lg border border-b-0 ${
              isActive
                ? 'border-slate-300 bg-white text-slate-900'
                : 'border-transparent bg-slate-300/60 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`ticket-tab-${id}`}
              onClick={() => switchTicket(id)}
              className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm font-medium"
            >
              {ticket.label}
              {itemCount > 0 ? (
                <span className="ml-1.5 text-xs font-normal text-slate-500">({itemCount})</span>
              ) : null}
            </button>
            <button
              type="button"
              aria-label={`Close ${ticket.label}`}
              onClick={(e) => {
                e.stopPropagation()
                closeTicket(id)
              }}
              className="mr-1 rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => createNewTicket()}
        className="mb-0 shrink-0 rounded-t-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-white/80"
        aria-label="New ticket"
      >
        + New Ticket
      </button>
    </div>
  )
}

/** Convenience hook for register surfaces bound to the active ticket. */
export function useActiveTicketCart() {
  const items = useCartStore(selectActiveItems)
  const amountReceived = useCartStore(selectActiveAmountReceived)
  return { items, amountReceived }
}
