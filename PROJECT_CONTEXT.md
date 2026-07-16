# POS System: Project Context & Architecture

## Mission
To provide a frictionless, high-speed point-of-sale system that empowers merchants to operate efficiently, starting with a lightweight core for simple checkouts and seamlessly scaling to handle complex retail operations on demand.

## Vision
To become the universal retail engine that grows alongside a business, offering an adaptable ecosystem where advanced capabilities—like inventory tracking, customer credit, and multi-tier pricing—can be toggled on exactly when a merchant needs them, never before.

## Core Philosophy: The "Opt-In" Architecture
This system is designed as a Modular Monolith. The core checkout experience must remain blazingly fast and independent. Advanced features (Inventory, CRM, Credit) exist as separate modules. 

If a merchant's `Store_Settings` flag for a feature (e.g., `enable_inventory`) is false, the system must completely bypass that logic to preserve performance and simplicity.

## Technology Stack
* **Backend:** Java 17+ with Spring Boot (Modular Monolith structure).
* **Database:** PostgreSQL (Relational integrity for transactions, JSONB for flexible tenant settings).
* **Frontend:** React with TypeScript and Vite. State management via Zustand. Styling via Tailwind CSS.
* **Infrastructure:** Docker for local development and containerization. Target deployment is AWS Fargate.