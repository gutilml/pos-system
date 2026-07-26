# Feature 093 — Frontend money display 2 decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green. Supersedes Feature **071** display scale.

## Summary

UI currency formatting is **2** decimal places. Payable/tender amounts use 2 dp HALF_UP so Pay Remaining can reach zero. Internal `roundMoney` stays at **4** scale. Checkout remaps payable tenders to the internal 4 dp total for the create-transaction API (non-cash cannot exceed BE grand total).

## Unlocks

None (bugfix / UX).

## Out of scope

* Backend / DB money scale; quantity/weight formatting; Feature **080+** deferred work.
