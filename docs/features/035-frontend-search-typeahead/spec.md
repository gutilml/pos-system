# Feature: Frontend Search Typeahead

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Name/SKU search should show a short live suggestion list so cashiers can pick the right product without committing on the first ambiguous Enter. Scanning and exact barcode Enter must stay as fast as today.

## User Stories

* As a cashier, I want suggestions after I type three characters so I can pick a product from a short list.
* As a cashier, I want results to update as I keep typing so I can narrow matches quickly.
* As a cashier, I want scanning a barcode and pressing Enter to still add the exact product immediately.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs). Cap results client-side at 10.
* **Depends on:** `GET /api/v1/products/search?q=` (Features 021/022).
* **Out of scope:** Changing backend `ProductServiceImpl.SEARCH_LIMIT` (25); debounce product redesign beyond what’s needed for correctness; customer search typeahead.

## UX & Business Rules

* **Threshold:** No typeahead request while trimmed query length &lt; 3.
* **Refresh:** On each keystroke at length ≥ 3, fetch again (abort or ignore stale responses with a request generation counter / `AbortController`).
* **Cap:** Display at most 10 rows (`results.slice(0, 10)`).
* **Add:** Click a row → `addItem(toCartProduct(row))`, clear query, keep search focused.
* **Enter:**
  * If a suggestion is highlighted, add that product.
  * Else keep today’s submit path: `searchProducts` → if empty show error; if results, add first row (exact-code backend returns singleton — instant barcode add).
* **Weight items:** Existing `addItem` → `pendingWeightProduct` path unchanged.
* Optional light loading indicator; clear suggestions when query drops below 3 or after successful add.

## Acceptance Criteria

1. [ ] No product search for typeahead when query length &lt; 3.
2. [ ] At length ≥ 3, each keystroke triggers a search (stale responses discarded).
3. [ ] UI shows ≤ 10 suggestions.
4. [ ] Clicking a suggestion adds the product and clears the query.
5. [ ] Enter with an exact barcode / singleton result still instant-adds.
6. [ ] Enter with a highlighted suggestion adds that suggestion.
7. [ ] Vitest covers threshold, cap, click-add, and Enter paths (mock `searchProducts`).
8. [ ] Pending “Search typeahead” notes Feature 035; `docs/README.md` updated.
