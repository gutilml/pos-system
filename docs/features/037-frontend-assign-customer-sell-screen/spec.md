# Feature: Frontend Assign Customer From Selling Screen

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Allow assigning a store-credit customer to the active ticket while still on the selling screen (before Pay), so CREDIT tenders and ticket context are ready without discovering the requirement only at checkout.

## User Stories

* As a cashier, I want to assign a customer to the open ticket while scanning items so CREDIT checkout is faster.
* As a cashier, I want to clear or change the assigned customer before paying if I picked the wrong person.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** `GET /api/v1/customers/search` (019/020); `useCartStore.setCustomer` (014).
* **Out of scope:** Backend changes; customer create/edit UI; dedicated tab balance pay-down screens; rewriting Pay modal CREDIT interception (036 may still gate if somehow missing).

## UX & Business Rules

* Entry point on selling screen: e.g. control near header or above footer (“Customer” / “Assign customer”) opening a compact panel/modal embedding `CustomerSearch`.
* On select: `setCustomer(assigned)`; show name (and optional available credit) on footer/register chrome (footer already shows customer when set).
* Clear control removes customer from the active ticket only.
* Per-ticket: switching `TicketTabs` keeps each ticket’s own `customer` (already in ticket state).
* Does not post a transaction by itself.
* If `enable_customer_credit` / search API errors, show the same class of error as checkout customer search (no silent fail).

## Acceptance Criteria

1. [ ] Cashier can open assign-customer UI from the selling screen without opening Pay.
2. [ ] Selecting a customer sets `selectActiveCustomer` on the active ticket and shows on the register chrome/footer.
3. [ ] Cashier can clear the assigned customer from the selling screen.
4. [ ] Assigned customer is available to Pay / CREDIT flows without re-select (036/014).
5. [ ] Vitest covers assign + clear on the selling-screen entry.
6. [ ] Pending “Assign customer from selling screen” notes Feature 037; `docs/README.md` updated.
