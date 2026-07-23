# Feature 028 — Frontend Multi SKU / Barcode Consumption

## Status

**Done**

## Behavior

* Consume Feature 027 `ProductDTO` (`skus`, `primarySku`, transitional `sku`).
* Cart lines show primary code when present; name-only products omit the code segment.
* Scanning any linked code still resolves via existing search (backend exact-code singleton).

## Depends on

Feature 027.

## Out of scope

Product/SKU admin UI (use `PUT …/skus` later); offline catalog; changing checkout `productId` payload.
