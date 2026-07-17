# Specification: Feature 007 - Backend Shift & Cash Drawer Management

## Objective
Implement the backend foundation for tracking cash register shifts. This module ensures cashiers must explicitly open a shift with a starting cash float and close it with a blind count, allowing the system to calculate any cash overages or shortages.

## Scope
* **Strictly Backend:** No frontend code.
* **Database Updates:** Introduce new `Shift` and `CashDrawerEvent` entities to PostgreSQL.
* **Core Integration:** Transactions created in Feature 003 must now be linked to an active `Shift`.

## Business Rules
* **Shift Lifecycle:** A store/register can only have one `OPEN` shift at a time. The status must be strictly enforced via an Enum (`OPEN`, `CLOSED`).
* **Expected Cash Calculation:** When a shift is closed, the system calculates `expected_cash` = `starting_cash` + (Total Cash Sales) - (Total Cash Refunds/Payouts). 
* **Discrepancy Logging:** The `Shift` entity must record `actual_cash` (what the cashier counted) and `discrepancy` (`actual_cash` - `expected_cash`).
* **Precision:** All monetary fields (`starting_cash`, `expected_cash`, `actual_cash`, `discrepancy`) MUST use `BigDecimal`.