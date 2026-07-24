# Feature 054 — Frontend Workspace Nav Shell

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — workspace nav under header; Sell built; Products stub; Customer/Inventory coming soon; Catalog modal still in CashierMenu until **055**.

## Behavior

* Keep the existing dark **POS Register** header (`RegisterScreen` title + `AssignCustomerControl` + `CashierMenu`).
* Add a **workspace nav row directly below** that header with buttons: **Register/Sell**, **Products**, **Customer**, and **Inventory** (Inventory only when `user.enableInventory === true`).
* v1: **Register/Sell** shows today’s sell UI; **Customer** and **Inventory** show “coming soon” placeholders; **Products** stub until Feature **055**.
* Keep **`AuthGate` → `ShiftGate`** wrapping the whole shell.
* Do **not** remove the CashierMenu Catalog modal yet (Feature **055**).

## Key files

* `frontend/src/features/register/RegisterScreen.tsx`
* `frontend/src/components/register/WorkspaceNav.tsx`
* `frontend/src/features/workspace/WorkspaceComingSoon.tsx`
* `frontend/src/features/workspace/workspaceIds.ts`
* i18n `messages.ts` EN/ES

## Depends on / follow-ups

* Depends on: Features **026** (AuthGate), **008/018** (ShiftGate), **042** (`enableInventory` on `/me`).
* Followed by: **055** (Products workspace + remove Catalog modal), **056** (product lookup load-or-create).
* Supersedes Catalog-as-primary-nav direction from Feature **053** (modal remains until 055).
