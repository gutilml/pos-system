# Implementation Plan - Frontend Pay Popup Three Amount Fields (Option A)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse:

```http
POST /api/v1/transactions
```

with Feature 013 `payments[]` (`paymentMethod`: `CASH` | `CARD` | `CREDIT`, `amount`). CARD remains external-terminal mark-paid semantics (023/036). No Java changes.

## Frontend Architecture

### Current baseline (replace interaction model)

* `CheckoutModal.tsx` — totals, CREDIT gate, PAY / Print and pay, wires `TenderInputArea` + `PaymentTenderList` + `addPayment`.
* `TenderInputArea.tsx` — single amount + method buttons + Add tender.
* `PaymentTenderList.tsx` — list + Remove.
* `useCartStore.ts` — `addPayment` appends rows (allows multiple per method); clamps each add to `selectBalanceDue`; `selectCanCompleteSale` requires exact total + CREDIT ⇒ customer.

### Target interaction

1. Replace method-toggle + Add + list with a three-field editor (new component or rewrite `TenderInputArea` → e.g. `TenderAmountFields.tsx`).
2. Sync ticket `payments` so there is **at most one** tender per method:
   * Add `upsertPayment(method, amount)` (or `setPaymentAmount`): if `amount ≤ 0`, remove that method’s payment; else replace/create single `{ id, method, amount }` after `roundMoney`.
   * Enforce no overpay: before upsert, `amount ≤ grandTotal − sum(other methods)`; reject/no-op + surface error from UI if over.
   * Prefer keeping `addPayment` as a thin wrapper calling upsert for test/back-compat, or update call sites/tests to upsert only — avoid leaving duplicate-method appends on the checkout path.
3. `CheckoutModal`:
   * Drop `PaymentTenderList`.
   * Wire three fields → `upsertPayment`.
   * Remaining / Tendered continue to use `selectBalanceDue` / `selectTotalTendered` (still valid with ≤1 row per method).
   * CREDIT gate: trigger from CREDIT field **onBlur** when parsed amount &gt; 0 and `!customer` (not on method focus). Keep abandon + Clear customer.
   * `completeSale`: map `payments` as today (already one row per method after upsert). Filter is defensive but should be redundant.
4. Open/reset: when modal opens or Cancel/`clearPayments`, fields show empty/0; do **not** auto-fill Remaining into CASH (current `TenderInputArea` focus fill goes away).
5. i18n (`frontend/src/i18n/messages.ts`): stop using `checkout.addTender` / `checkout.noTenders` in UI; add keys for field labels / overpay / CREDIT blur copy if needed (EN + ES). Method codes may remain `CASH`/`CARD`/`CREDIT` as labels.

### Tests

* Rewrite `CheckoutModal.test.tsx` flows: type into `getByLabelText('CASH')` (etc.) instead of Add tender; assert Remaining; overpay; CREDIT blur → gate; PAY payload one entry per method; Print and pay.
* Extend `useCartStore.test.ts` for `upsertPayment` (replace, zero-removes, overpay guard, no duplicate methods).
* Remove or slim `PaymentTenderList` / old `TenderInputArea` tests if components are deleted.

## Additional Considerations

* Money: always `roundMoney` / `formatMoney` (Feature 033).
* Persist: ticket `payments` still in Zustand persist — upsert keeps persistence shape compatible.
* Feature 037 pre-assigned customer: CREDIT blur must not reopen search.
* Do not revive Stripe QR or footer Card shortcut.
* FE/BE separation: frontend-only commit; update `docs/pending feature/frontend.md` + `docs/README.md` on ship.
