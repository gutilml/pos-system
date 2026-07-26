# Plan — 082 Backend transaction lifecycle

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Approach

1. Product workshop: hold ownership, stock timing, relation to client TicketTabs (**009**).
2. State machine service for allowed transitions.
3. Controller endpoints; inventory/payment side effects per design.
4. Tests for each transition; unlock FE **083**.
