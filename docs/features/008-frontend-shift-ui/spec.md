# Specification: Feature 008 - Frontend Shift UI & State Hydration

## Objective
Implement the cashier-facing UI for opening and closing shifts, and establish a robust state hydration mechanism so the frontend perfectly mirrors the backend shift status even if the browser crashes or the tab is closed.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory.
* **State Recovery:** The application must query the backend on mount (`GET /api/v1/shifts/current`) to determine if the authenticated user has an active shift.
* **Cart Persistence:** The active cart state must survive browser closures using Zustand's `persist` middleware (saving to `localStorage`).

## UX & Business Rules
* **The Shift Gate:** If no open shift exists for the current user, the main Register screen must be completely blocked by a mandatory "Open Shift" modal prompting for `startingCash`.
* **Close Shift Flow:** The "Close Shift" button must be tucked away in a Cashier Menu (not easily clicked by accident). Clicking it triggers the "Blind Count" modal, asking for `actualCash`.
* **Zero Trust:** The frontend must never assume a shift is open indefinitely; it relies on the backend endpoint as the source of truth.