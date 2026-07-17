# Pending Features — Frontend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever frontend work is shipped or a new frontend gap is found. Mark done items `[x]`, note partials, and append newly discovered follow-ups.

## Wire-up to live backend

- [ ] **Replace mock catalog** — `mockProducts.ts` still drives SearchBar. Point search/scan at Product APIs (list + barcode lookup once backend exposes it).
- [ ] **Complete Sale → `POST /api/v1/transactions`** — CheckoutFooter currently stays client-only. Must send line items, `amountReceived`, `taxRate`, `storeId`, and respect open shift.
- [ ] **Dev API proxy** — Vite proxy (or env base URL) so `/api/v1/*` hits the Spring Boot backend locally.
- [ ] **`GET /api/v1/shifts/current` dependency** — UI already calls it; blocked on backend endpoint (see backend pending). Until then hydration fails open / shows Open Shift after error.

## Shift UX polish

- [ ] **Remove `DEFAULT_STORE_ID` hardcode** — Store selection or auth-derived store context.
- [ ] **Cash drawer pay-in / pay-out UI** — Backend `POST /shifts/{id}/events` exists; no cashier UI yet.
- [ ] **Post-close discrepancy summary** — Blind count submits `actualCash`; optionally show expected/discrepancy after close (manager-only?).
- [ ] **Shift status in header** — Open-since time, starting cash, quick indicator while selling.

## Register / cart

- [ ] **Tax rate from store settings** — Today cart `taxRate` is local state; load from backend when settings API exists.
- [ ] **Offline / API error toasts** — Consistent handling when open/close/checkout/product calls fail.
- [x] **Open / held tickets (tabs)** — Feature 009: multi-ticket Zustand + `TicketTabs` (client-side hold/switch). Void / server-backed held tickets still pending.
- [ ] **Void tickets** — UI for void once backend supports those statuses.
- [ ] **Receipt / print** — After successful transaction (browser print or receipt printer).

## Auth & multi-store

- [ ] **Login / session** — Cashier identity for shift gate and audit.
- [ ] **Store picker** — Multi-store merchants; stop using a single hardcoded UUID.

## Opt-in module UIs

- [ ] **Inventory screens** — Stock levels, adjustments, low-stock — only when `enable_inventory` is true.
- [ ] **Customer credit UI** — When that module exists on the backend.

## Tooling / quality

- [ ] **E2E smoke** — Open shift → scan → weight item → checkout → close shift against a running backend.
- [ ] **Accessibility pass** — Modals, focus traps, scanner-first keyboard flow.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
