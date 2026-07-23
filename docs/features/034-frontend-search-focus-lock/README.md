# Feature 034 — Frontend Search / Scan Focus Lock

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — Vitest green.

## Behavior

* `requestRegisterSearchFocus()` restores `#register-search` when no `aria-modal` dialog is open.
* Search `onBlur` re-focuses unless focus moved to `[data-register-editable]` (cart qty/discounts, global %) or a modal.
* Weight cancel/Escape, checkout close, and cashier drawer/close-shift close call the helper.

## Key files

* `frontend/src/lib/registerSearchFocus.ts`
* `frontend/src/components/register/SearchBar.tsx`
* `frontend/src/features/register/RegisterScreen.tsx`
