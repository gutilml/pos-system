# Feature: Frontend Footer Totals Total Only

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Reduce register footer clutter by showing one money figure cashiers need while selling — **Total** — and optionally **Discount saved** when a discount applies. Subtotal and Tax lines leave the always-visible footer (tax still factors into Total via existing selectors).

## User Stories

* As a cashier, I want a single Total on the footer so the cart list has more vertical room and the pay bar is easier to read.
* As a cashier, I want to still see how much discount was saved when a discount is active so I can confirm the deal without opening Pay.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 016 footer totals / discount-saved; Feature 033 money 2 dp display.
* **Out of scope:** Changing tax math or `taxRate` source; removing global discount entry (040 relocates it); Pay modal grand-total / remaining display (036/041); backend tax settings API.

## UX & Business Rules

* In `CheckoutFooter` totals `<dl>`: remove Subtotal and Tax rows.
* Keep Total bound to `selectGrandTotal` (includes tax).
* Keep conditional Discount saved (`selectTotalDiscountAmount` &gt; 0) above Total.
* Do not remove `taxRate` from the store or from checkout POST — only hide the Tax line in the footer UI.
* Global discount input remains where it is until Feature 040 moves it (implement 039 without depending on 040).

## Acceptance Criteria

1. [ ] Footer does not show a Subtotal line.
2. [ ] Footer does not show a Tax line.
3. [ ] Footer shows Total equal to `selectGrandTotal` (tax still included in the number).
4. [ ] Discount saved appears only when savings &gt; 0; otherwise omitted.
5. [ ] Vitest for `CheckoutFooter` asserts absence of Subtotal/Tax labels and presence of Total / discount-saved when applicable.
6. [ ] Pending “Footer totals: Total only” notes Feature 039 triad path; `docs/README.md` updated.
