# Pending Features — Frontend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever frontend work is shipped or a new frontend gap is found.

**Done pattern (easy scan):** When an item is fully complete, use `[x]` **and** wrap the item text in markdown strikethrough:

```markdown
- [x] ~~**Short title** — Feature NNN: brief note.~~
```

Open / deferred / on-hold items stay `[ ]` with **no** strikethrough. Partials stay `[ ]` with a one-line note of what remains. Promoted-but-not-shipped items stay `[ ]` with a triad path note.

## Phase A — live register wire-up (planned triads)

Frontend slice of Phase A (small features, FE/BE separated). Pair with backend 017 → 019 → 021:

| # | Feature folder | Status |
|---|----------------|--------|
| 018 | `docs/features/018-frontend-shift-gate-hydration/` | ~~**Done** — honest ShiftGate (no fail-open on API error)~~ |
| 020 | `docs/features/020-frontend-customer-search-wireup/` | ~~**Done** — `storeId` + live search~~ |
| 022 | `docs/features/022-frontend-live-product-catalog/` | ~~**Done** — replace `mockProducts` with live search~~ |
| 023 | `docs/features/023-frontend-external-terminal-card/` | ~~**Done** — CARD = mark paid on Pay; Stripe QR off happy path~~ |

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 011 code. External terminal + mark paid on Complete. Do not schedule Stripe QR / status-poll as Phase A work.

## Wire-up to live backend

- [x] ~~**Replace mock catalog** — Feature 022: `SearchBar` uses `GET /products/search`; `mockProducts.ts` removed.~~
- [ ] **Complete Sale → `POST /api/v1/transactions`** — Card path and split-pay **Pay** modal (Feature 014) both POST transactions. Legacy single-amount cash path removed; remaining gap is richer error/toast UX when POST fails.
- [x] ~~**Dev API proxy** — Feature 011: Vite `server.proxy` forwards `/api` → `http://localhost:8080`.~~
- [x] ~~**`GET /api/v1/shifts/current` dependency** — Feature 018: `fetchCurrentShift(storeId)` + ShiftGate Retry on API failure (no fail-open). Backend Feature 017.~~
- [ ] **`GET /api/v1/transactions/{id}/status`** — Feature 011 polls this for Stripe QR auto-complete. **On hold with Stripe-in-POS** — not required while CARD is external-terminal + mark-paid-on-Complete.
- [x] ~~**Adopt `payments[]` transaction payload** — Feature 014: `createTransaction` + CheckoutModal send Feature 013 `payments[]` (+ `customerId` when credit is used).~~
- [x] ~~**`GET /api/v1/customers/search`** — Feature 020: `searchCustomers` sends `storeId` + `q` (Feature 019 backend).~~

## Payments (frontend)

- [x] ~~**Stripe QR checkout modal + polling** — Feature 011 shipped; **keep in codebase**. Stripe-in-POS path **ON HOLD (2026-07-17)** for small-store design (external card terminal).~~
- [x] ~~**Split payments + store-tab assignment UI** — Feature 014: CheckoutModal tenders, CREDIT customer interception, `payments[]` checkout POST.~~
- [x] ~~**Cash / multi-tender Complete Sale persistence** — Feature 014 Pay → Complete Transaction POSTs and closes the ticket on success.~~
- [x] ~~**CARD tender = mark paid on Pay (external terminal)** — Feature 023: Card button POSTs `COMPLETED` + CARD tender (no Stripe QR). Pay modal CARD tenders unchanged. Stripe client code kept (ON HOLD).~~
- [ ] **Split-pay CARD → Stripe session** — **ON HOLD** with Stripe-in-POS; revive when integrated card is re-enabled.
- [x] ~~**Pay modal redesign (CASH / CARD / CREDIT split, no over-tender)** — Feature 036: remove footer Card; split CASH/CARD/CREDIT; no overpay; CREDIT needs customer; PAY + Print and pay.~~
- [x] ~~**Assign customer from selling screen** — Feature 037: attach/clear customer on open ticket before Pay.~~

## Register UX polish (decisions 2026-07-22)

- [x] ~~**Money display 2 decimals** — Feature 033: money UI 2 dp; math/API stay 4; qty may keep 4.~~
- [x] ~~**Search/scan focus lock** — Feature 034: focus search when no modal; restore after close / Escape.~~
- [x] ~~**Search typeahead** — Feature 035: ≥3 chars, each keystroke, max 10; Enter/click adds; barcode Enter exact still instant.~~
- [x] ~~**Weight modal keyboard** — Feature 032: weight field accepts physical keyboard (not readOnly).~~

## Register UX polish (review 2026-07-23)

Follow-ups from live Pay / cart review (mock: method buttons + Grand total / Remaining; PAY disabled until Remaining = 0). Promoted to FE-only triads (keep `[ ]` until shipped):

- [x] ~~**Cart line chrome** — Feature 038: hide SKU/unit price; headers Product · Qty · Discount · Subtotal; Item % in Discount. Stock = 043.~~
- [x] ~~**Footer totals: Total only** — Feature 039: remove Subtotal/Tax from footer; keep Total (+ Discount saved when useful).~~
- [x] ~~**Global discount as footer button** — Feature 040: Discount between Clear and Pay opens global % entry.~~
- [x] ~~**Pay modal layout (split tenders)** — Feature 041: amount left + method stack; Remaining emphasized; PAY when Remaining = 0 (036 math unchanged).~~
- [ ] **Cart Stock column** — Feature [043](../features/043-frontend-cart-stock-column/): when `enableInventory`, insert Stock between Qty and Discount; `displayStock = currentStock − line qty` (one line per `productId`); "—" if product not tracking; hide column+header when inventory off. Depends on BE [042](../features/042-backend-product-stock-inventory-flag/) + layout [038](../features/038-frontend-cart-line-chrome/).

## Shift UX polish

- [ ] **Remove `DEFAULT_STORE_ID` hardcode** — Feature 026 prefers `/me.storeId` via `selectStoreId`; constant remains as unauthenticated/fallback until multi-store picker.
- [x] ~~**Cash drawer pay-in / pay-out UI** — Feature 031: Cashier menu Pay in/out → `DrawerEventModal` → `POST /shifts/{id}/events` (Feature 007).~~
- [x] ~~**Post-close discrepancy ticket** — Feature 024: after blind close, `ShiftCloseTicket` shows API expected/actual/discrepancy; Print via `window.print`; Done → Open Shift gate. No manager auth.~~
- [x] ~~**Post-close ticket CARD + CREDIT totals** — Feature 030: blind count kept; ticket sales summary shows CASH / CARD / CREDIT (store tab) + sales grand total from Feature 029.~~
- [ ] **Shift status in header** — Open-since time, starting cash, quick indicator while selling.

## Register / cart

- [x] ~~**Multi SKU/barcode per product (UX)** — Feature 028: register consumes `skus` / `primarySku`; cart shows primary when present; name-only OK. Admin SKU list UI still deferred.~~
- [x] ~~**Item and global discount UI** — Feature 016: per-line item `%`, footer global `%`, backend-aligned cascade math (`discountPricing.ts`), strikethrough + “No Global %” badge, API payload fields on Pay and Card checkout.~~
- [ ] **Tax rate from store settings** — Today cart `taxRate` is local state; load from backend when settings API exists.
- [ ] **Offline / API error toasts** — Consistent handling when open/close/checkout/product calls fail.
- [x] ~~**Open / held tickets (tabs)** — Feature 009: multi-ticket Zustand + `TicketTabs` (client-side hold/switch). Void / server-backed held tickets still pending.~~
- [ ] **Void tickets** — UI for void once backend supports those statuses.
- [x] ~~**Receipt / print** — Pay-path browser print covered by Feature 036 Print and pay. Standalone/historical reprint & hardware printers still TBD.~~

## Auth & multi-store

### Auth decisions (2026-07-22) — mirror backend pending

- JWT in HttpOnly cookies + CSRF (`XSRF-TOKEN` / `X-XSRF-TOKEN`) + credentials on API calls.
- Roles ADMIN + CASHIER; **equal permissions for now** (no role-gated UI yet).
- Single store for now; drop `DEFAULT_STORE_ID` hardcode in favor of store from auth/config once BE exposes it on `/me` (or keep seed UUID until then).
- User management **UI deferred** until user CRUD API exists.
- Shift ↔ user linking **deferred (Option C)** — Auth v1 login only; shift gate stays store-scoped until a later follow-up.

- [x] ~~**Login / logout UI (v1)** — Feature 026: LoginForm + AuthGate before ShiftGate; login/logout/me; `apiFetch` credentials + CSRF. Logout in CashierMenu.~~
- [x] ~~**Current-user context (v1)** — Feature 026: `useAuthStore` holds user (+ role); `selectStoreId` from `/me` with `DEFAULT_STORE_ID` fallback.~~
- [ ] **System user management UI** — Admin screens to create/edit/deactivate users. **Deferred** with backend user CRUD API.
- [ ] **Role-gated navigation and actions** — Deferred until ADMIN vs CASHIER permissions diverge. Shift close with discrepancy remains cashier-allowed; no manager override for variance.
- [ ] **Store picker / multi-org UX** — Deferred with multi-organization / multi-store tenancy (Oxxo-, Walmart-style orgs with many stores). Not in Auth v1.

## Opt-in module UIs

- [ ] **Inventory screens** — Stock levels, adjustments, low-stock — only when `enable_inventory` is true. Register cart Stock column promoted separately as Feature [043](../features/043-frontend-cart-stock-column/) (needs BE [042](../features/042-backend-product-stock-inventory-flag/)).
- [ ] **Customer credit UI** — Feature 014 shipped checkout CREDIT at sale time. Assign-from-register shipped as Feature **037**. Still missing dedicated tab pay-down / ledger screens outside checkout (design TBD).
- [x] ~~**Receipt / print on pay** — Feature 036: Print and pay = complete + print sell ticket + return to ready register.~~

## Tooling / quality

- [ ] **E2E smoke** — Open shift → scan → weight item → checkout → close shift against a running backend.
- [ ] **Accessibility pass** — Modals, focus traps, scanner-first keyboard flow.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
