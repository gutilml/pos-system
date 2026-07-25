# Plan — 073 Frontend closed tickets + reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Refactor [`CheckoutFooter`](../../../frontend/src/components/register/CheckoutFooter.tsx): five controls; embed/move Assign from [`RegisterScreen`](../../../frontend/src/features/register/RegisterScreen.tsx).
2. `frontend/src/api/transactions.ts`: list/get/reimburse clients.
3. New UI: closed tickets list + detail/reimburse (modal or side panel).
4. EN/ES messages; Vitest layout + reimburse payload.
5. Docs Done; commit `feat(073): …`.
