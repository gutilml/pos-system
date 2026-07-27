# Feature 104 — Closed Ticket Line Names + Tender i18n

## Status

**Done** — product name exposed from backend and rendered in the closed-ticket detail; payment methods localized using existing `tender.*` i18n keys.

## Problems Solved

In `ClosedTicketsModal.tsx` the detail view had two display issues:

1. **Line items** always rendered `Product #<shortId>` because `TransactionItemResponseDTO` carried no product name.
2. **Payment methods** printed raw Java enum strings (`CASH`, `CARD`) instead of locale labels (`CASH` EN / `EFECTIVO` ES).

## Backend Changes

- `TransactionItemResponseDTO` gains a `String productName` field (second position, after `productId`).
- `TransactionServiceImpl.toDto()` populates `productName` from `item.getProduct().getName()`, null-safe.
- `TransactionControllerTest` updated to pass the new field in stub DTOs.
- New unit test `create_itemDtoIncludesProductName` in `TransactionServiceImplTest` asserts the field is mapped.

## Frontend Changes

- `TransactionItemResponse` type in `transactions.ts` gains `productName?: string | null`.
- `ClosedTicketsModal`:
  - Line label: `item.productName?.trim() ? item.productName : "Product #<shortId>"`.
  - Payment labels: replaced raw `p.paymentMethod` join with `tenderLabel(method, t)` helper (uses `tender.cash` / `tender.card` / `tender.credit` — same keys used in `SaleTicket.tsx`).
- Two new Vitest cases:
  - `productName` shown when present; fallback to id prefix when absent.
  - CASH label renders `CASH` (EN) in both list row and detail panel.

## Key Files

- `backend/src/main/java/com/pos/core/dtos/TransactionItemResponseDTO.java`
- `backend/src/main/java/com/pos/core/services/TransactionServiceImpl.java`
- `frontend/src/api/transactions.ts`
- `frontend/src/components/register/ClosedTicketsModal.tsx`
- `frontend/src/components/register/ClosedTicketsModal.test.tsx`
