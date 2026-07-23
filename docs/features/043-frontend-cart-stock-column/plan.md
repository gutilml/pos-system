# Implementation Plan - Frontend Cart Stock Column

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None in this feature. Requires Feature **042** shipped (or mocked in Vitest).

## Frontend Architecture

### Auth flag

* Add `enableInventory?: boolean` to `AuthUser` in `frontend/src/api/auth.ts`.
* Ensure login/`fetchMe` parse it; expose via `useAuthStore` (selector e.g. `selectEnableInventory`).
* Default missing field to `false` for older servers during rollout.

### Product → cart types

* `ProductApi`: `currentStock?: number`, `trackInventory?: boolean`.
* `CartProduct` / `CartItem`: same fields; `toCartProduct` maps `Number(dto.currentStock ?? 0)` and `dto.trackInventory === true`.
* `useCartStore` add path: when creating a new line, copy stock fields; when merging qty on existing `productId`, preserve existing stock snapshot fields.

### UI

* `RegisterScreen`: conditional Stock header when `enableInventory`.
* `CartItemRow`: conditional Stock cell; compute `displayStock` with `roundMoney(item.currentStock - item.quantity)` (or shared helper); show "—" when `!item.trackInventory`.
* Align CSS grid with Feature 038 so the Stock track is optional (`grid-template-columns` variants or conditional column).

### Tests

* Unit: display helper / row renders "12" when stock 15 qty 3; "—" when not tracked; no Stock node when flag false.
* `toCartProduct` / auth parse tests for new fields.
* Mock `useAuthStore` or wrap with inventory on/off in component tests.

## Additional Considerations

* **Implement after 042;** ideally after or with 038 so headers already exist. If 043 lands before 038, still hide SKU/unit price is 038’s job — do not duplicate chrome work here beyond Stock insertion.
* Snapshot staleness: mid-shift stock changes from other registers won’t refresh until re-add; acceptable for v1.
* Do not block Pay on negative stock in this feature.
* FE/BE separation: no Java in this commit.
