# Feature: E2E register smoke (regression)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Promote the pending “E2E smoke” item: open shift → scan/sale → weight item → checkout → close shift, implemented as tagged regression tests (BE MockMvc + FE Vitest regression config).

## Acceptance Criteria

1. [x] BE `@Tag("regression")` covers weight-line sale in addition to unit sale, close, list, reimburse.
2. [x] Asserts opener/closer usernames on open/close when present.
3. [x] FE `test:regression` covers weight `addItem` → `confirmWeight` plus existing auth/shift/reimburse smoke.
4. [x] Documented run commands; triad + catalog; remove from pending FE.
5. [x] Default `mvn test` / `npm test` remain unchanged (regression still excluded / separate script).
