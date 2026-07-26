# Implementation Plan - Frontend tax rate store config

## Approach

1. Add `settings` to [`workspaceIds.ts`](../../../frontend/src/features/workspace/workspaceIds.ts) + [`WorkspaceNav`](../../../frontend/src/components/register/WorkspaceNav.tsx).
2. [`StoreSettingsWorkspace.tsx`](../../../frontend/src/features/admin/StoreSettingsWorkspace.tsx) tax form via `setTaxRateAndPersist`.
3. Wire in [`RegisterScreen.tsx`](../../../frontend/src/features/register/RegisterScreen.tsx).
4. Remove tax UI from [`CashierMenu.tsx`](../../../frontend/src/components/shift/CashierMenu.tsx); move tests to StoreSettingsWorkspace.
