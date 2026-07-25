# Feature: Backend Inventory Movements

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Ship inventory admin backends: product stock list, movement history, receive/adjust with audit trail, `wholesale_margin` on products, receive cost/price blending, and sale deduction that allows negative stock while recording SALE movements.

## Scope

* **Strictly Backend**
* **Out of scope:** FE 063; admin notify; purge on disable

## Acceptance Criteria

1. [x] GET inventory products + low-stock filter; GET movements; POST movements
2. [x] Receive blends cost/selling/wholesale when unitCost changes; adjust qty-only ≥ 0
3. [x] Child movements apply to parent
4. [x] Sale allows negative + SALE movement rows
5. [x] wholesale_margin on product; tests + docs
