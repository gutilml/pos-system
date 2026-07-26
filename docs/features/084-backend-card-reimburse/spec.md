# Feature: Backend CARD reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Feature **072** rejects any ticket with a CARD tender. CARD refunds need a payment policy: external terminal manual refund only, Stripe Refund API, or hybrid. Deferred until that policy is set.

## User Stories

* As a cashier, I want to reimburse a CARD (or mixed CARD) sale according to store policy.
* As an admin, I want refunds to leave an auditable trail tied to the original payment.

## Scope

* **Strictly Backend:** reimburse path for CARD portions.
* **Depends on:** **072**; payment policy (external terminal vs Stripe).
* **Unlocks:** FE **085**.

## APIs

* Extend `POST /api/v1/transactions/{id}/reimburse` to accept CARD tickets when policy allows.
* Document refund side effects (manual note only vs Stripe refund id).

## Acceptance Criteria

1. [ ] Payment policy documented and implemented.
2. [ ] CARD (and mixed) reimburses succeed under policy; stock/ledger rules consistent with **072**.
3. [ ] Clear reject when policy forbids automated CARD refund.
4. [ ] JUnit; pending/catalog when Done.
