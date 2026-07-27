# Implementation Plan - Frontend mock scale (dev/settings toggle)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None. Preference is browser-local (`localStorage`), same class of client preference as `SCALE_BANNER_DISMISS_KEY`.

## Frontend Architecture

### Preference helper

[`frontend/src/utils/serialScaleHelper.ts`](../../../frontend/src/utils/serialScaleHelper.ts):

* `MOCK_SCALE_STORAGE_KEY`, `MOCK_SCALE_WEIGHT = 1`, `MOCK_SCALE_CHANGE_EVENT`
* `isMockScaleEnabled()` / `setMockScaleEnabled(enabled)` — write `localStorage` + custom event so open register UI can refresh

### WeightModal

Mock on → set `weightInput` to `MOCK_SCALE_WEIGHT`, skip `readScaleWeight`. Read button uses the same fake weight and stays enabled without Web Serial.

### Settings UI

[`StoreSettingsWorkspace.tsx`](../../../frontend/src/features/admin/StoreSettingsWorkspace.tsx) Scale block: checkbox toggle + hint above Connect panel.

### ScaleConnectBanner

Register mode: return null when mock enabled. Settings (`alwaysShow`): unchanged connect UI.

## Additional Considerations

* Mock is available outside Vite `DEV` so demos work without a scale; clear labeling reduces risk of leaving it on at a live register.
* Out of scope: virtual COM, live streaming, editable mock weight, backend store flag.
