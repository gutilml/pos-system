# Plan — 084 Backend CARD reimburse

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Lock refund policy (manual external vs Stripe).
2. Extend **072** reimburse service; remove blanket CARD reject under policy.
3. Persist refund reference if Stripe; otherwise audit reason.
4. Tests; unlock FE **085**.
