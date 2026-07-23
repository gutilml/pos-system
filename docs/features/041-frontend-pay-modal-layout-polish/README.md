# Feature 041 — Frontend Pay Modal Layout Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* Incremental layout polish on Feature 036 — **not** a rewrite of tender math.
* Amount field left; CASH / CARD / CREDIT stacked as method choices on the right; Remaining emphasized in the header.
* PAY / Print and pay only when Remaining = 0 (exact cover; no overpay). Print and pay stays secondary.

## Key files

* `frontend/src/components/checkout/CheckoutModal.tsx`
* `frontend/src/components/checkout/TenderInputArea.tsx`
* Related Vitest under `frontend/src/components/checkout/`
