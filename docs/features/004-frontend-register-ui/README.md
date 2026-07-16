# Feature 004: Frontend Core Register UI

## Purpose

High-speed single-column cashier register: search/scan at top, scrollable cart in the middle, checkout footer pinned at the bottom. Client-side cart math via Zustand; mock catalog until live API wiring.

## Layout

```text
┌─────────────────────────┐
│ POS Register (header)   │
├─────────────────────────┤
│ Search / Scan Barcode   │  ← autofocus
├─────────────────────────┤
│ Cart items (scroll)     │
│  …                      │
├─────────────────────────┤
│ Totals + Amount Received│  ← auto-select on focus
│ Change Due / Complete   │
└─────────────────────────┘
```

## Key files

| Path | Role |
| --- | --- |
| `src/store/useCartStore.ts` | Cart state + money selectors |
| `src/components/register/*` | SearchBar, CartItemRow, CheckoutFooter |
| `src/features/register/RegisterScreen.tsx` | Full-height assembly |
| `src/data/mockProducts.ts` | Scanner/search mock catalog |

## UX rules

- Search field autofocuses for barcode scanners.
- Amount Received defaults to grand total; focus selects all text for overwrite typing.
- Change Due updates as the cashier edits Amount Received.

## Tests

```bash
cd frontend
npm test
```

Mock SKUs for manual checks: `1001` (Cola), `1002` (Chips), `1003` (Water), `1004` (Coffee).
