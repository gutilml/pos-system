# Feature: Frontend inventory receive blend preview

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers mistook Feature **066** lot selling (e.g. `66.6667` from cost `40`) for the final product price. After save, Feature **062** blends with on-hand stock (e.g. cost `37.5` / selling `62.5`). Show the post-blend result live in the receive modal.

## User Stories

* As a cashier, I want to see the product cost and selling price after a receive so they match what I see on the product after Guardar.
* As a cashier, I still want to edit incoming lot prices before save.

## Scope

* **Strictly Frontend:** [`inventoryPricing.ts`](../../../frontend/src/lib/inventoryPricing.ts), [`InventoryWorkspace.tsx`](../../../frontend/src/features/admin/InventoryWorkspace.tsx), i18n, Vitest, docs.
* **Depends on:** Feature **062** (BE blend), Feature **066** (lot margin preview).
* **Unlocks:** none.

## Locked defaults

* Keep BE weighted-average blend; do not overwrite with lot prices.
* Editable fields = incoming lot; read-only panel = after-receive product prices via FE WAC matching BE.
* Cost unchanged → preview shows current product prices (no rewrite).
* Invalid qty → hide preview.

## Acceptance Criteria

1. [x] Lot fields labeled as incoming lot (EN/ES).
2. [x] After-receive preview shows blended cost/selling/wholesale when qty + cost are valid.
3. [x] User case: stock 10 @ 35 / 58.3333, receive 10 @ 40 / 66.6667 → preview `37.50` / `62.50`.
4. [x] Vitest + triad/catalog Done; **066** notes **094**.
