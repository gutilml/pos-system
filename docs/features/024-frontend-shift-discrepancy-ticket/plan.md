# Plan: Feature 024 - Frontend Shift Discrepancy Ticket

## Backend Architecture

None for this feature. `ShiftController.closeShift` / `ShiftServiceImpl.closeShift` already persist and return:

* `expectedCash`, `actualCash`, `discrepancy`, `startingCash`, `openedAt`, `closedAt`, `status: CLOSED`

No new endpoints required.

## Frontend Architecture

### Capture close response — `useShiftStore.ts`
* Today `closeShift` awaits `closeShiftRequest` but **discards** the returned `Shift`.
* Change `closeShift` to return `Promise<Shift>` (closed shift), still:
  * `resetAllTickets()`
  * `set({ currentShift: null, … })` so `ShiftGate` treats the register as closed
* Optionally hold `lastClosedShift: Shift | null` in the store for the ticket UI, cleared on dismiss / next open.

### Flow wiring — `CloseShiftModal.tsx` / `CashierMenu.tsx`
* On successful submit: keep blind-count form closed; open **ShiftCloseTicket** with the closed shift payload.
* Prefer lifting ticket open state to `CashierMenu` (or a thin parent) so the ticket can remain visible after `CloseShiftModal` unmounts and while `currentShift` is already null.

### New UI — `components/shift/ShiftCloseTicket.tsx` (name flexible)
* Screen/modal showing expected / actual / discrepancy (+ timestamps).
* **Print** button → `window.print()`.
* Print CSS: `@media print` hide chrome (Cashier menu, register), show ticket content full-bleed / high contrast.
* **Done** clears `lastClosedShift` / closes ticket.

### Formatting
* Reuse existing money display patterns in the register (tabular nums, consistent decimals). Do not recompute discrepancy on the client except for display helpers (sign label); source of truth remains API fields.

### Tests
* `useShiftStore.test.ts`: assert close returns/stores closed shift fields from mocked `closeShiftRequest`.
* Component tests: ticket renders API values; dismiss clears; print handler invoked (mock `window.print`).
* Ensure CloseShiftModal still does not render expected cash pre-submit.

## Additional Considerations

* **Expected-cash accuracy (backend gap, out of scope here):** `ShiftServiceImpl.calculateExpectedCash` adds `sumGrandTotalByShiftId` (all transaction `grandTotal`s), not CASH tender amounts from `transaction_payments`. With CARD/CREDIT/split tenders, expected drawer cash can be overstated. Feature 024 surfaces whatever close returns. Recommend a follow-up backend item (e.g. sum CASH payment amounts + pay-ins − pay-outs) if demos use non-cash tenders.
* **No thermal printer / ESC-POS** in this feature—browser print only (aligns with pending “Receipt / print” still being a separate backlog item for sales).
* FE/BE separation: do not mix a cash-math fix into this commit/feature.
