# Implementation Plan - Frontend Global Discount Footer Button

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Reuse Feature 015/016 discount fields on checkout POST unchanged.

## Frontend Architecture

### `CheckoutFooter.tsx`

* Remove the permanent global-discount `<label>` / `<input id="global-discount">` block.
* Add middle button between Clear and Pay; `useState` for discount UI open.
* Move draft/commit helpers (`globalDraft`, `commitGlobalDiscount`, `fractionToDisplayPercent` / `parseDisplayPercentToFraction`) into the opened UI (inline panel or tiny `GlobalDiscountModal` under `components/register/`).
* Mark discount controls with `data-register-editable` so Feature 034 does not steal focus while editing.
* On close/blur commit path: call `requestRegisterSearchFocus()` as today.

### Visual affordance

* If global % &gt; 0, show percent on the button label (e.g. `Discount 10%`) or `data-testid` active state for tests.

### Tests

* Update `CheckoutFooter.test.tsx`: no `getByLabelText('Global Discount %')` on initial render; click Discount → set value → assert discount-saved / Total.
* Ensure Pay still opens checkout; Clear still clears cart.

## Additional Considerations

* Implement after 039 so the footer action row is the main remaining height consumer.
* Keep FE/BE separation; no Java.
* Do not combine with 041 in one commit — discount is sell-screen chrome; pay layout is modal-only.
