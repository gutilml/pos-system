# Feature 049 — Frontend UI Locale Remaining Chrome

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — remaining register popups/gates wired through EN/ES after Features 046/048.

## Behavior

Translate cashier-facing chrome still hardcoded English under Spanish locale:

* Pay: credit gate, Clear / available credit, CASH/CARD/CREDIT labels
* Close Shift, Pay in/out (drawer), Open Shift hints
* Weight modal (reuse + extend `weight.*`)
* Sale ticket + Shift close ticket
* Auth/Shift loading and error gates

## Out of scope

* Stripe QR modal (on hold)
* Product/customer names from API
* Parametrized cart qty aria strings (optional follow-up)

## Depends on

* Features **046**, **048**
