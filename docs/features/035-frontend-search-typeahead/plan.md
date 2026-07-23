# Implementation Plan - Frontend Search Typeahead

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Backend Architecture

None required. Continue calling existing:

```http
GET /api/v1/products/search?q={query}
```

Backend may return up to 25 rows; FE displays `slice(0, 10)`. Exact active code still returns a single-element list (Feature 021).

## Frontend Architecture

### `SearchBar.tsx`

* State: `suggestions: ProductApi[]`, `highlightIndex`, `searching` (reuse), generation id or `AbortController`.
* `onChange`: update query; if `trim().length < 3` clear suggestions; else async `searchProducts` and set suggestions to first 10.
* Render a listbox under the input (`role="listbox"` / `option`) — keep layout register-native (no new design system).
* Keyboard: ArrowUp/ArrowDown move highlight; Enter uses highlight if set, else existing `submitQuery`.
* Click option → add + clear.

### `products.ts`

* No API shape change. Optionally accept `signal?: AbortSignal` on `searchProducts` for cancel — nice-to-have.

### Coordination

* Feature 034: keep focus on the input while the list is open (do not move focus into the list unless implementing full roving tabindex — prefer aria-activedescendant on the input).

### Tests

* Mock `searchProducts`; assert no call under 3 chars; assert slice to 10; click and Enter behaviors.

## Additional Considerations

* Rapid typing: abort/ignore stale to avoid flicker.
* Empty suggestion list at ≥ 3 chars: show quiet empty state or reuse “No product found” only on Enter submit — avoid noisy errors while typing.
* FE/BE separation: do not change `SEARCH_LIMIT` in this feature.
