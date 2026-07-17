# Plan: Feature 010 - Backend Stripe Checkout Integration

## Phase 1: Dependencies & Configuration
* Add the `stripe-java` dependency to `pom.xml` / `build.gradle`.
* Add Stripe configuration properties to `application.yml` (`stripe.api.key` and `stripe.webhook.secret`).
* Create a `StripeConfig.java` class to initialize the Stripe API key on application startup.

## Phase 2: Service Layer
Create `StripePaymentService.java`:
* `createCheckoutSession(Transaction transaction)`: Builds a Stripe Session with line items, setting currency to `mxn`. Returns the Session URL/ID.
* `handleWebhook(String payload, String sigHeader)`: Verifies the signature and processes the event.

## Phase 3: REST Controllers
Create `PaymentController.java`:
* `POST /api/v1/payments/checkout/{transactionId}`: Triggers the session creation.
* `POST /api/v1/payments/webhook`: Listens for Stripe events (must consume raw JSON strings to verify the signature properly).

## Phase 4: Testing & Backlog Grooming
* Write unit tests for `StripePaymentService` ensuring the `BigDecimal` to cents conversion is perfectly accurate.
* **Grooming:** Read `docs/pending_features/backend.md` and remove/resolve any bullet points mentioning Stripe, payments, or checkout integration.