# Specification: Feature 004 - Frontend Core Register UI

## Objective
Build the high-speed, single-column cashier register interface. The UI must be optimized for speed, barcode scanner inputs, and touch screens, relying on a reactive state management system to handle cart calculations instantly.

## Scope
* **Strictly Frontend:** Only work within the `frontend/` directory (React, Vite, TypeScript).
* **State Management:** Use Zustand to manage the active cart (`ticket`) state, handling line-item additions, quantity updates, and total calculations dynamically on the client side.
* **Mock API Integration:** For now, the Zustand store can use mock data or basic Axios calls to the `/api/v1/` endpoints built in Feature 003.

## Business Rules & UX Constraints
* **Scanner-First Focus:** The main "Search / Scan Barcode" input field must remain highly accessible and auto-focus whenever possible.
* **Auto-Select Payment:** The "Amount Received" input field in the footer must default to the exact order total. When a user clicks/taps it, all text must instantly highlight so typing overwrites the total immediately.
* **Layout:** Implement the single-column layout (Search at top, Cart items in the middle, Checkout/Totals footer at the bottom).