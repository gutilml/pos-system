# Feature: Frontend UI Locale Coverage Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

After Feature 046, several high-traffic register strings remain hardcoded English. Wire them through the existing lightweight `t()` / `messages.ts` dictionaries so Spanish UI is consistent for customer assignment, new tickets, and the cart inventory column header.

## User Stories

* As a cashier using Spanish, I want the Customer button and customer search popup in Spanish so the assign flow matches the rest of the register.
* As a cashier using Spanish, I want “+ New Ticket” labeled **Ticket nuevo**.
* As a cashier, I want the cart inventory column header shortened to **Inv** so it fits the column without crowding.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs, `docs/README.md`).
* **Depends on:** Feature **046** (`useT`, EN/ES maps, store locale).
* **Out of scope:** Backend/API; translating product/customer **names** from the catalog; Pay modal CREDIT gate prose beyond keys already in scope if already covered; full audit of every remaining English string in admin/shift deep paths (only the three gaps below unless trivially adjacent in the same files).

## Gaps (must fix)

1. **`AssignCustomerControl`** — footer **Customer** button (may already use `footer.customer`; verify) and any popup chrome still hardcoded; ensure assigned/clear copy uses dictionaries.
2. **`CustomerSearch`** — e.g. “Find customer” label/placeholder and empty/error strings via `t()`.
3. **`TicketTabs`** — “+ New Ticket” → EN keep sensible “+ New Ticket”; ES **“Ticket nuevo”** (include leading `+` or match existing visual pattern).
4. **Cart Stock header** — change short label to **Inv** in EN (and ES: use **Inv** unless a clearer short Spanish label is agreed—default **Inv** both locales for width).

## UX & Business Rules

* Reuse Feature 046 patterns: `MessageKey` + `en` / `es` in `messages.ts`; components call `useT()`.
* Do not introduce `localStorage` locale; do not add `react-i18next`.
* Aria-labels used in tests (`Find customer`, etc.) must follow translated strings or stable `aria-label` keys—update Vitest accordingly.
* Stock → **Inv** is a **label** change for space; column behavior from Feature 043 unchanged.

## Acceptance Criteria

1. [x] With locale `es`, Customer control + `CustomerSearch` visible strings are Spanish (dictionaries).
2. [x] With locale `es`, new-ticket control shows **Ticket nuevo** (or `+ Ticket nuevo` matching existing `+` pattern).
3. [x] Cart inventory column header shows **Inv** (EN and ES default).
4. [x] With locale `en`, Customer / Find customer / New Ticket remain correct English.
5. [x] Vitest covers at least one ES assertion for Customer search or New Ticket, and Inv header when stock column shown.
6. [x] Pending frontend item marked done; `docs/README.md` catalog/topic updated for 048.
