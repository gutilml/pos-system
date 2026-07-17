# Feature 006: Frontend Bulk & Weight Input Modal

## Purpose

When a `sellByWeight` product is scanned, cart add is intercepted and a touch numpad modal collects the weight (with optional Web Serial scale read).

## Flow

1. Cashier scans/searches a weight-based SKU (mock: `2001` Deli Ham).
2. `addItem` sets `pendingWeightProduct` and does **not** add to the cart.
3. `WeightModal` opens; cashier enters weight via numpad or **Read from Scale**.
4. **Confirm** calls `confirmWeight(qty)` and adds the line item.

## Key files

| Path | Role |
| --- | --- |
| `src/store/useCartStore.ts` | Interception + `confirmWeight` / `clearPendingWeight` |
| `src/utils/serialScaleHelper.ts` | Web Serial read + parse helper |
| `src/components/register/WeightModal.tsx` | Numpad modal UI |
| `src/features/register/RegisterScreen.tsx` | Mounts modal when pending |

## Graceful fallback

If `navigator.serial` is missing or the scale read fails, the cashier uses the on-screen numpad. Errors are shown inline; checkout is not blocked.

## Tests

```bash
cd frontend
npm test
```
