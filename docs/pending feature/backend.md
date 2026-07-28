# Pending Features — Backend

Discussion list. Not scheduled work — capture gaps and follow-ups to decide later.

**Maintenance:** Update this file whenever backend work is shipped or a new backend gap is found.

**When an item ships:** **delete it** from this list (history lives in `docs/features/` + the catalog in `docs/README.md`).

Open / deferred / on-hold items stay `[ ]`. Partials stay `[ ]` with a one-line note of what remains. Promoted-but-not-shipped items stay `[ ]` with a triad path note.

## Phase A — live register wire-up

Phase A backend wire-up features are shipped (017, 019, 021). Paired frontend: 018, 020, 022, 023.

**Stripe-in-POS:** ON HOLD (2026-07-17). Keep Feature 010 APIs/code. CARD = external terminal; mark paid on Pay via `COMPLETED` + `payments[]`. Do not schedule Stripe session / IN_PROGRESS-for-Stripe / status-poll as Phase A backend work.

## Shift & cash drawer

## Catalog & checkout APIs

- [ ] **Transaction lifecycle** — triad: [`082-backend-transaction-lifecycle`](../features/082-backend-transaction-lifecycle/README.md). **Deferred** (product design). Unlocks FE **083**. Reimburse of COMPLETED sales shipped as Feature [072](../features/072-backend-closed-tickets-reimburse/README.md).
- [ ] **Reimburse sales that include CARD** — triad: [`084-backend-card-reimburse`](../features/084-backend-card-reimburse/README.md). **Deferred** (payment policy). Unlocks FE **085**.

## Payments

- [ ] **Stripe checkout for split-payment CARD portions** — **ON HOLD (2026-07-17).** Target merchants use a **separate physical card terminal**; POS will not drive Stripe Checkout for CARD tenders for now. **Keep all existing Stripe APIs/code** (Feature 010/011) in the codebase for a later opt-in path — do not delete. When CARD is selected in checkout, treat it like any other tender: on **Pay / Complete Transaction**, persist the sale as paid (`COMPLETED` with `payments[]` including CARD). No Stripe session, no QR modal required for that path.
- [ ] **Create IN_PROGRESS transactions for card sales** — **Deferred with Stripe hold.** Cash/complete path persists `COMPLETED` immediately; revive IN_PROGRESS + Checkout Session when Stripe card-in-POS is re-enabled.
- [ ] **`GET /api/v1/transactions/{id}/status`** — Still useful for Feature 011 QR polling when Stripe resumes; **not blocking** the external-terminal CARD flow. Keep on backlog after Phase A live wire-up unless needed sooner.

## Opt-in modules (vision / schema)

- [ ] **Multi-tier / customer pricing** — triad: [`090-backend-multi-tier-pricing`](../features/090-backend-multi-tier-pricing/README.md). **Deferred** (design needed). FE companion TBD later.
- [ ] **Notify admin/restock owner when sale drives stock negative** — triad: [`091-backend-negative-stock-notify`](../features/091-backend-negative-stock-notify/README.md). **Deferred** (channel TBD). Unlocks FE **092**.
- [ ] **When inventory disabled: optional delete/purge inventory data?** — **Dropped** (no triad). Inventory tab stays read-only with last data (**063**).

## Platform / ops

### Auth decisions (2026-07-22) — for upcoming Feature 025+

- **Token:** JWT in **HttpOnly** cookies (stateless; no DB session lookup per request).
- **CSRF:** Spring CSRF with readable `XSRF-TOKEN` cookie; SPA sends `X-XSRF-TOKEN` on mutating requests (Axios/fetch helper).
- **CORS:** Strict allowlist — only the React app origin.
- **Roles (v1):** `ADMIN` + `CASHIER` only; **for now both can do everything** (roles exist for future gating; no manager role yet).
- **Tenancy (v1):** **Single store** only (continue using the demo store / one `store_settings` row). Multi-org / multi-store deferred (see below).
- **User provisioning (v1):** Seed and/or SQL only — **no** user CRUD API yet (deferred below).
- **Shift ↔ user:** Auth v1 did not change shift open/current/close. Follow-up triads **079** (Option A audit stamps) and **086** (cashier-own reimburse) are shipped.

- [ ] **User management API** — Create / update / deactivate / list users (ADMIN). **Deferred** after Auth v1 login works. Pair with FE user-mgmt screen.
- [ ] **Role-based authorization policies** — Deferred: when ADMIN vs CASHIER should differ (drawer rules, catalog admin, etc.). v1: both allowed everywhere once authenticated. Related: drawer caps in **081**.
- [ ] **Multi-organization / multi-store tenancy** — Future model: organizations (e.g. Oxxo, Walmart) → many stores under an org; same platform serving multiple orgs. Not in Auth v1. Needs org tables, store membership, and picker UX later.
- [ ] **CORS / API versioning conventions** — Partially decided (strict React origin for Auth v1); confirm for SPA + Fargate deployment hosts/env.

---

_Add notes under each item as we discuss. Promote decided items into a `docs/features/00N-*` triad._
