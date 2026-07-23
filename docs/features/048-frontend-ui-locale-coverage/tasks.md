# Task Checklist — Feature 048 Frontend UI Locale Coverage Polish

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- None.

## Frontend Tasks

- [x] 1. Add/update EN+ES keys in `messages.ts` (customer search, new ticket, `cart.stock` → Inv).
- [x] 2. Wire `AssignCustomerControl` + `CustomerSearch` through `useT()`.
- [x] 3. Wire `TicketTabs` new-ticket label (`Ticket nuevo` in ES).
- [x] 4. Confirm cart header shows **Inv** via `cart.stock` (or wire if still hardcoded).
- [x] 5. Update pending frontend + `docs/README.md` for Feature 048 (Planned → Done on ship).

## Test Tasks

- [x] 6. Update Vitest queries for translated aria/labels; assert ES for at least New Ticket or Find customer; assert Inv header when inventory column visible.
