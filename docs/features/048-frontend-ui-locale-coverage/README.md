# Feature 048 — Frontend UI Locale Coverage Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Customer assign/search, New Ticket, and cart Inv header wired through EN/ES dictionaries.

## Behavior

Close EN/ES gaps left after Feature 046:

1. **Customer** footer control + assign popup / `CustomerSearch` strings through `t()`.
2. Ticket tab **“+ New Ticket”** → ES **“+ Ticket nuevo”**.
3. Cart header **Stock** short label → **Inv** (EN and ES).

## Key files

* `frontend/src/i18n/messages.ts`
* `frontend/src/components/register/AssignCustomerControl.tsx`
* `frontend/src/components/checkout/CustomerSearch.tsx`
* `frontend/src/components/register/TicketTabs.tsx`
* Cart header via `t('cart.stock')` in `CartItemRow.tsx`

## Depends on

* Feature **046** (i18n plumbing + store `uiLocale`).
