# Feature: Frontend Global Discount Footer Button

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Free vertical space in the register center/cart by moving global percentage discount off the always-visible footer block. Cashiers open discount entry from a button placed between **Clear** and **Pay**, then return to scanning with Total (and Discount saved when applicable) still visible on the footer.

## User Stories

* As a cashier, I want global % off the permanent footer stack so cart lines get more room.
* As a cashier, I want a Discount control between Clear and Pay so I can still apply or clear a ticket-wide % without hunting in menus.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 016 `setGlobalDiscountPercentage` + display/fraction helpers; Feature 034 focus restore after editable close; Feature 039 preferred first so totals are already slim (can implement after 039 in the same polish wave).
* **Out of scope:** Item % UI changes (038 keeps item % on rows); backend discount engine; changing cascade math; Pay modal redesign (041).

## UX & Business Rules

* Remove the always-visible “Global Discount %” labeled input from the top of `CheckoutFooter`.
* Action row layout: **Clear** | **Discount** | **Pay** (Discount between Clear and Pay). Pay remains the primary/wider action if the current flex weighting is preserved for Pay.
* Discount opens a compact modal, sheet, or inline popover with the existing percent input semantics (whole percent display, fraction on commit, Enter/blur commit).
* Closing the entry restores register search focus (`requestRegisterSearchFocus`) per Feature 034.
* When `globalDiscountPercentage` &gt; 0, Discount button may show a subtle active state or current % so cashiers see a discount is on without reopening (optional but recommended).
* Discount saved row (if still present after 039) continues to reflect applied global/item savings.
* Empty cart: Discount may stay enabled (0% on empty is harmless) or disabled — prefer **enabled** so cashiers can set % before scanning if desired; document chosen rule in README when implementing.

## Acceptance Criteria

1. [ ] Footer no longer shows an always-visible Global Discount % input in the totals stack.
2. [ ] A Discount (or equivalent) button sits between Clear and Pay.
3. [ ] Opening the button reveals global % entry; committing updates `selectActiveGlobalDiscountPercentage` and totals.
4. [ ] Closing discount entry restores search focus (034 pattern).
5. [ ] Vitest covers open → set % → Total/Discount saved update; always-visible input absent.
6. [ ] Pending “Global discount as footer button” notes Feature 040 triad path; `docs/README.md` updated.
