# Feature: Backend Parent Package Stock Deduction on Sale

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Extend checkout inventory deduction (Feature 005) so sales of child/bulk products linked to a parent reduce the **parent’s** `current_stock`, counted in whole packages (fractional packages allowed). Formula: `Δparent = −(soldQtyInPackageUnit ÷ parent.qtyPerPackage)`. Only when store inventory is enabled and products track inventory appropriately (document whether parent and/or child `trackInventory` must be true).

## User Stories

* As a merchant, when I sell one bottle from a 50-pack, I want the case inventory to decrease by 1/50.
* As a merchant, when I sell 0.5 kg from a 1 kg bag, I want bag inventory to decrease by 0.5.

## Scope

* **Strictly Backend** (transaction/inventory path).
* **Depends on:** Feature **050** (parent package fields + link); Feature 005 deduction pipeline; Feature 042 store inventory flag.
* **Out of scope:** FE (**053**); creating parent package data (050); negative-stock policy changes unless required.

## Business Rules

1. Resolve parent from line product’s `parentProductId`.
2. Convert sold quantity into parent `packageUnit` if child sell UoM differs (same conversion table as 050 cost).
3. `delta = soldQtyInParentUnit / parent.qtyPerPackage` (scale-4 money/stock rounding).
4. Decrement `parent.currentStock` by `delta` when inventory enabled and parent tracks inventory (exact flags TBD in implementation — prefer: deduct parent when parent.`trackInventory`; child may or may not track its own stock).
5. Insufficient parent stock: follow existing Feature 005 insufficient-stock behavior (reject vs allow) — document choice; default **reject** if parent tracks inventory.
6. No parent → existing single-product deduction only.

## Acceptance Criteria

1. [ ] Sale of linked child adjusts parent stock by `sold÷qtyPerPackage` in package units.
2. [ ] Water and rice examples covered by tests.
3. [ ] No-op when inventory disabled or no parent.
4. [ ] Insufficient parent stock handled per documented rule.
5. [ ] Pending + catalog updated.
