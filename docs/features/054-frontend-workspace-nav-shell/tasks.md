# Task Checklist — Feature 054 Frontend Workspace Nav Shell

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Refactor `RegisterScreen.tsx` so header + new workspace nav sit above a body switch; keep `AuthGate` / `ShiftGate`; extract sell body if it keeps the file readable.
- [x] 2. Add `WorkspaceNav` (Register/Sell, Products, Customer, Inventory gated by `enableInventory`).
- [x] 3. Add Coming Soon placeholder panels for Customer and Inventory; Products stub until **055**.
- [x] 4. Add EN/ES i18n keys for workspace labels + coming soon; extend `messages.test.ts`.
- [x] 5. Vitest: Inventory visibility + workspace switching (Sell vs placeholders).
- [x] 6. On ship: set this README Status to Done; check off pending frontend **054**; set `docs/README.md` catalog row to Done.

## Test Tasks

- [x] 7. Vitest green for workspace nav + gated Inventory button.
