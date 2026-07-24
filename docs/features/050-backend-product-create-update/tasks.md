# Task Checklist — Feature 050

## Backend Tasks

- [x] 1. Schema + entity/DTO fields (wholesale, targetMargin, package unit/qty naming, low stock on write).
- [x] 2. Store `preferences.default_margin` support (045).
- [x] 3. Pricing service: effective margin, bidirectional price↔margin, child cost from parent + unit conversion.
- [x] 4. Create + update endpoints; parent completeness validation; cascade child cost on parent change.
- [x] 5. Inventory field gating by store `enable_inventory`.
- [x] 6. Docs: schema, pending, `docs/README.md`; note 051–053.

## Test Tasks

- [x] 7. JUnit for create/update, margin both ways, parent link errors, child cost, inventory gating.
