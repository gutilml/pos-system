# Feature 111 — Parent Package Dropdown Rules

## Status

**Done** — Escape closes parent/category searchable menus; children hidden from parent picker; BE rejects child-as-parent.

## Summary

- `SearchableSelect`: Escape closes menu, keeps selection.
- Parent options exclude products that already have `parentProductId`.
- `ProductServiceImpl.applyParentLink` rejects parents that themselves have a parent.

## Key files

- `frontend/src/features/admin/SearchableSelect.tsx`
- `frontend/src/features/admin/ProductEditorForm.tsx`
- `backend/src/main/java/com/pos/core/services/ProductServiceImpl.java`
