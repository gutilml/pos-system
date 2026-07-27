# Task Checklist

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Tasks

- [x] None (FE-only).

## Frontend Tasks

- [x] 1. Add mock-scale preference API + `MOCK_SCALE_WEIGHT` in `serialScaleHelper.ts`; unit tests for get/set.
- [x] 2. Wire Settings toggle in `StoreSettingsWorkspace.tsx` under Scale; EN/ES strings in `messages.ts`.
- [x] 3. Update `WeightModal.tsx`: mock path for auto-fill and Read; leave Feature 099 path when mock off.
- [x] 4. Update `ScaleConnectBanner.tsx` so register pairing CTA is suppressed when mock is on.
- [x] 5. Extend `WeightModal.test.tsx` (+ banner/helper tests); run Vitest for touched files.

## Docs Tasks

- [x] 6. Write triad under `docs/features/100-frontend-mock-scale-toggle/`; catalog + Topic row in `docs/README.md`.
