# Feature 110 — Frontend Product Edit Top Back / New Product

## Status

**Done** — Edit mode shows Back (left) and New product (right) beside “Editing product”, with discard confirm when the form is dirty.

## Summary

- Edit-only toolbar: Back → lookup; New product → blank create.
- Dirty tracking via form fingerprint; dirty Back/New/Cancel prompts discard confirm.
- Create mode keeps the existing create banner (no top Back/New).

## Key files

- `frontend/src/features/admin/ProductsWorkspace.tsx`
- `frontend/src/features/admin/ProductEditorForm.tsx`
- `frontend/src/i18n/messages.ts`
