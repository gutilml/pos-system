# Plan: Feature 009 - Frontend Open Tickets (Tabs) Management

## Phase 1: State Management Refactor
Refactor `src/store/useCartStore.ts`:
* Change state structure: 
  * `tickets: Record<string, CartItem[]>` (or an array of Ticket objects).
  * `activeTicketId: string`.
* Update actions (`addItem`, `removeItem`) to only affect the array associated with `activeTicketId`.
* Add new actions: `createNewTicket()`, `switchTicket(ticketId)`, `closeTicket(ticketId)`.

## Phase 2: UI Components
Create `src/components/register/TicketTabs.tsx`:
* A scrollable horizontal flex container.
* Render a clickable tab for each ticket in the store. Highlight the active one visually.
* Include a "+ New Ticket" button at the end of the row.

## Phase 3: Integration
* Mount `<TicketTabs />` inside `RegisterScreen.tsx`, directly above the main search/barcode input or the cart grid.
* Ensure the `CheckoutFooter` computations pull strictly from the `activeTicketId` array.

## Phase 4: Testing & Backlog Grooming
* Update existing Vitest tests to accommodate the new nested Zustand state.
* **Grooming:** Read `docs/pending_features/frontend.md` and remove/resolve any bullet points mentioning "tabs", "multiple carts", or "holding orders".