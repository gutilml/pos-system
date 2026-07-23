# Task Checklist — Feature 036 Frontend Pay Modal Redesign & Print and Pay

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Remove footer Card shortcut from `CheckoutFooter.tsx`.
- [x] 2. Enforce no-over-tender in `addPayment` / tender UI; exact-total `selectCanCompleteSale`; drop overpay change UI.
- [x] 3. Redesign `CheckoutModal` actions: primary **PAY**, secondary **Print and pay**; keep CASH/CARD/CREDIT split + CREDIT customer gate / abandon path.
- [x] 4. Add printable `SaleTicket` and wire Print and pay → POST → print → ready register.
- [x] 5. Document README; promote Pay redesign / Print and pay / related receipt pending items with Feature 036; update `docs/README.md`.

## Test Tasks

- [x] 6. Vitest: reject over-tender; CREDIT customer required; PAY posts `payments[]`; Print and pay calls `window.print`; footer has no Card.
