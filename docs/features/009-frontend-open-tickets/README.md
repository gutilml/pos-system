# Feature 009 — Frontend Open Tickets (Tabs)

## Overview

Cashiers can hold multiple in-progress tickets at once. Each tab owns its own cart lines and amount-received; switching tabs swaps the active cart without losing data. There is always at least one open ticket.

## Architecture

| Piece | Role |
|-------|------|
| `useCartStore` | `tickets` + `ticketOrder` + `activeTicketId`; mutations scope to the active ticket |
| `TicketTabs` | Horizontal tabs + “+ New Ticket”; close generates a blank tab if last |
| `selectActiveItems` / `selectActiveAmountReceived` | Register UI selectors |
| Persist v2 | Migrates legacy single-cart `pos-cart` payloads |

## Usage

`RegisterScreen` mounts `<TicketTabs />` above the search bar. Closing a shift calls `resetAllTickets()` so the next shift starts with one empty ticket.
