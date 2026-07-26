# Implementation Plan - Frontend inventory receive blend preview

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. [`frontend/src/lib/inventoryPricing.ts`](../../../frontend/src/lib/inventoryPricing.ts): `weightedAverageMoney` + `previewReceiveBlend` (mirror BE **062**).
2. [`InventoryWorkspace.tsx`](../../../frontend/src/features/admin/InventoryWorkspace.tsx): lot labels; `inventory-receive-preview` panel with `formatMoney`.
3. i18n EN/ES keys; Vitest for helper + workspace blend case.
4. Docs triad Done; catalog **094**; **066** README cross-note.

## Backend

None.
