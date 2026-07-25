# Feature: Frontend closed tickets + reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Move Assign customer into the checkout footer row, add Previous tickets, and ship review + reimburse UI against Feature **072**.

## User Stories

* As a cashier, I want Assign and Previous tickets on the same row as Clear/Discount/Pay.
* As a cashier, I want to open past tickets, pick lines/qty, and reimburse CASH/CREDIT sales.

## Scope

* **Strictly Frontend:** `frontend/` (+ docs).
* **Depends on:** **072**.

## UX

1. Footer order: **Clear | Discount | Assign customer | Previous tickets | Pay**.
2. Reduce visual weight of Clear / Discount / Pay (no Pay `flex-[2]` dominance).
3. Remove Assign from header (or hide) so it is not duplicated.
4. Previous tickets → modal/panel: list COMPLETED → detail → select lines + qty → confirm.
5. If ticket has CARD: show not reimbursable (pending BE message).
6. Full EN/ES chrome.

## Acceptance Criteria

1. [x] ~~Footer layout matches locked order; Assign only on footer.~~
2. [x] ~~List/detail/reimburse wired to **072**.~~
3. [x] ~~Partial line+qty selection; CARD blocked UX.~~
4. [x] ~~Vitest + pending + catalog when Done.~~
