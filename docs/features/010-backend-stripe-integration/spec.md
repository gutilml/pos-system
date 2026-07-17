# Specification: Feature 010 - Backend Stripe Checkout Integration

## Objective
Implement the backend integration with Stripe to facilitate digital card payments. The system must generate Stripe Checkout Sessions and securely listen for Stripe Webhooks to update the local transaction status.

## Scope
* **Strictly Backend:** No frontend code.
* **Localization:** Transactions must be configured to process in MXN (Mexican Pesos). 
* **Backlog Management:** Review and update `docs/pending_features/backend.md` to check off or remove items related to payment gateways or Stripe integration.

## Business Rules & Technical Constraints
* **Precision to Cents:** Stripe requires amounts in the smallest currency unit (cents). The system must safely convert the `BigDecimal` grand total to a `Long` (e.g., multiplying by 100) before sending to Stripe.
* **Webhook Security:** The Webhook endpoint (`/api/v1/payments/webhook`) MUST verify the Stripe signature using the endpoint secret to prevent spoofed payment confirmations.
* **Transaction State:** When the webhook receives a `checkout.session.completed` event, the corresponding local `Transaction` status must be updated from `IN_PROGRESS` (or `HELD`) to `COMPLETED`.