# Feature: Frontend negative-stock notify

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Surface backend negative-stock notifications to admin/cashier UI once **091** defines the channel. Complements register-line warning already in inventory UX.

## User Stories

* As an admin, I want to see or acknowledge negative-stock alerts in the POS UI (if channel is in-app).

## Scope

* **Strictly Frontend.**
* **Depends on:** BE **091**.
* **Unlocks:** none.

## UX

* TBD by channel: toast, notification center, or settings “notify me” toggle only.
* Do not duplicate register warning already shown at sale time unless product wants both.
* EN/ES.

## Acceptance Criteria

1. [ ] UX matches chosen **091** channel.
2. [ ] Admin/cashier visibility per role if required.
3. [ ] EN/ES; component tests; pending/catalog when Done.
