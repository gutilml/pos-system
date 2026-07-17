# Plan: Feature 008 - Frontend Shift UI & State Hydration

## Phase 1: State Management (Zustand) Updates
* **Cart Persistence:** Wrap `useCartStore.ts` in Zustand's `persist` middleware to automatically sync the cart array to `localStorage`.
* **Shift Store:** Create `src/store/useShiftStore.ts`:
  * State: `currentShift` (object or null), `isLoading` (boolean).
  * Actions: `checkCurrentShift()` (calls `GET /api/v1/shifts/current`), `openShift(amount)`, `closeShift(amount)`.

## Phase 2: Core Components
Create UI components in `src/components/shift/`:
* `ShiftGate.tsx`: A wrapper component. If `isLoading` is true, show a spinner. If `currentShift` is null, render `OpenShiftModal`. If `currentShift` exists, render `children` (the Register).
* `OpenShiftModal.tsx`: A form requiring a numeric input for starting cash. Calls `openShift`.
* `CloseShiftModal.tsx`: A form requiring a numeric input for the blind count. Calls `closeShift`.
* `CashierMenu.tsx`: A small dropdown or slide-out menu containing the "Close Shift" trigger button.

## Phase 3: Application Integration
* Wrap the `RegisterScreen` component inside `<ShiftGate>`.
* Add `CashierMenu` to the top header navigation of the application.
* Trigger `checkCurrentShift()` inside a `useEffect` at the root of the app.

## Phase 4: Testing Strategy
* Write Vitest tests verifying that `useCartStore` successfully writes and reads from `localStorage`.
* Write React Testing Library tests for `ShiftGate` ensuring it blocks rendering of children when no shift is active.