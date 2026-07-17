# Feature 008 — Frontend Shift UI & State Hydration

## Overview

Cashier-facing shift gate for the register: the UI hydrates shift status from the backend on mount, blocks selling until a shift is open, and persists the cart across browser reloads.

## Architecture

| Piece | Role |
|-------|------|
| `useCartStore` + Zustand `persist` | Cart items/tax/`amountReceived` survive tab close via `localStorage` (`pos-cart`) |
| `useShiftStore` | Zero-trust shift lifecycle: `checkCurrentShift`, `openShift`, `closeShift` |
| `api/shifts.ts` | Thin `fetch` client for `/api/v1/shifts/*` |
| `ShiftGate` | Spinner → Open Shift modal → register children |
| `OpenShiftModal` / `CloseShiftModal` | Starting cash / blind-count actual cash |
| `CashierMenu` | Header dropdown with “Close Shift” |

## API contract (frontend)

- `GET /api/v1/shifts/current` — open shift or 404/null
- `POST /api/v1/shifts/open` — `{ storeId, startingCash }`
- `POST /api/v1/shifts/{id}/close` — `{ actualCash }`

Until auth exists, open uses `DEFAULT_STORE_ID` in `api/shifts.ts`.

## Usage

`RegisterScreen` is wrapped in `<ShiftGate>` and shows `CashierMenu` in the header. On close, the cart is cleared so the next shift starts clean.
