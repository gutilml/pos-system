# Implementation Plan - Backend parent pc no weight child

## Approach

1. `ProductPricing.isPiecePackageUnit(unit)` — true for `pc` / `pza`.
2. In `ProductServiceImpl.applyParentLink`, after parent load: if sellByWeight and piece parent → throw.
3. Tests in `ProductServiceImplTest`.
