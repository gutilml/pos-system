# Specification: Feature 009 - Frontend Open Tickets (Tabs) Management

## Objective
Enable cashiers to handle multiple transactions simultaneously. If a customer forgets their wallet or needs to grab another item, the cashier must be able to "hold" the current ticket, open a new blank ticket for the next person in line, and switch back seamlessly.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript).
* **State Restructuring:** The Zustand `useCartStore` must evolve from managing a single array of items to managing a dictionary or array of `Ticket` objects, with a pointer to the `activeTicketId`.
* **Backlog Management:** This feature must review and update `docs/pending_features/frontend.md` to check off or remove any items related to cart management or holding tickets.

## UX & Business Rules
* **Visual Tabs:** The UI must display a horizontal row of tabs above the register grid, one for each open ticket. 
* **Seamless Switching:** Clicking a tab must instantly swap the active cart items and recalculate the footer totals without losing any entered data.
* **Empty State:** There must always be at least one active ticket. If the last tab is closed or cashed out, a new blank tab must automatically generate.