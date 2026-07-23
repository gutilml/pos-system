# Implementation Plan - Frontend Cash Drawer Pay-In / Pay-Out

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Consume Feature 007:

```http
POST /api/v1/shifts/{id}/events
Content-Type: application/json

{ "type": "PAY_IN" | "PAY_OUT", "amount": number, "reason": string }
```

Validation already enforced server-side (`amount` ≥ 0.0001, `reason` not blank, shift must exist / be usable per existing service rules).

## Frontend Architecture

### API — `frontend/src/api/shifts.ts`

* Add `CashDrawerEventType = 'PAY_IN' | 'PAY_OUT'`.
* Add request/response types matching backend DTOs.
* Add `addDrawerEventRequest(shiftId, { type, amount, reason })` using `apiFetch` + `parseJson`.

### UI

* New modal component (e.g. `DrawerEventModal.tsx`) with:
  * Type control (Pay in / Pay out)
  * Amount input (reuse money patterns from open/close shift modals)
  * Reason text input
  * Submit / Cancel
* Wire from `CashierMenu.tsx`: menu items (or single “Cash drawer…” entry) open the modal when `useShiftStore.currentShift` is set.
* Optional thin store action on `useShiftStore` (e.g. `addDrawerEvent`) for loading/error parity with open/close — or call the API helper directly from the modal; prefer store if other shift mutations already live there.

### Tests

* Unit/component tests: validation (blank reason, non-positive amount), success closes modal and calls API with correct body, error keeps modal open.
* Extend `CashierMenu` tests if present (or add) for menu visibility with/without open shift.

## Additional Considerations

* Do not display expected cash or invent client-side expected math after a pay-in/out.
* Policy follow-ups (caps, manager auth, reason presets) stay on pending backend — not this feature.
* Keep FE/BE separation: no Java changes in this commit.
