# Specification: Feature 014 - Frontend Split Payments & Customer Credit UI

## Objective
Revamp the checkout interface to support multiple payment methods (split payments) per transaction and integrate the Customer Credit (Store Tab) UI for assigning tickets to specific customers.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript, Tailwind).
* **State Management:** Update the Zustand store to manage an array of `PaymentTender` objects for the active ticket, tracking how much of the grand total has been covered.
* **Backlog Management:** Review and update `docs/pending_features/frontend.md` to check off items related to split payments, customer assignment, and credit/tabs.

## UX & Business Rules
* **The Payment Modal:** When the cashier hits "Pay", a modal opens displaying the `Grand Total` and the `Remaining Balance`. 
* **Adding Tenders:** The cashier can add multiple payment lines (e.g., CASH: $200, CREDIT: $300).
* **Customer Interception:** If a cashier adds a `CREDIT` tender, the UI must immediately check if a customer is assigned to the ticket. If not, it must display a search bar to look up and attach a customer, displaying their available credit limit.
* **Validation:** The "Complete Transaction" button must remain disabled until the sum of all tenders is greater than or equal to the Grand Total.