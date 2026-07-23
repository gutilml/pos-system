# Feature: Frontend Weight Modal Keyboard Input

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers using a physical keyboard (or scanner wedge that types digits) must be able to enter bulk/weight quantities in the weight modal without relying only on the on-screen numpad. Today the weight `<input>` is `readOnly`, which blocks keyboard entry.

## User Stories

* As a cashier, I want to type the weight on a physical keyboard so I can enter bulk items quickly without tapping the on-screen pad.
* As a cashier, I still want the on-screen numpad and “Read from Scale” so touch and scale flows keep working.

## Scope

* **Strictly Frontend:** `frontend/` (+ feature/pending docs).
* **Depends on:** Feature 006 weight modal.
* **Out of scope:** Backend APIs; search focus after confirm (034); money display scale (033); changing Web Serial helper behavior beyond accepting typed values into the same state.

## UX & Business Rules

* Remove `readOnly` from `#weight-input` (keep `inputMode="decimal"`).
* Typed input updates the same `weightInput` string used by the numpad (`appendKey` / backspace still work).
* Prefer focusing the weight input when the modal opens so keyboard entry is immediate.
* Validation unchanged: Confirm enabled only when parsed weight is finite and &gt; 0.
* Numpad and scale path remain; copy may say “enter weight” rather than “numpad only.”

## Acceptance Criteria

1. [ ] Weight field is editable via physical keyboard (not `readOnly`).
2. [ ] Digits, decimal point, and backspace from the keyboard update the displayed weight.
3. [ ] On-screen numpad still appends/edits the same value.
4. [ ] Confirm adds the weighted line when weight &gt; 0; Cancel clears pending weight.
5. [ ] Modal autofocuses the weight input when a pending weight product appears.
6. [ ] Vitest covers keyboard/`onChange` path (and existing confirm/cancel).
7. [ ] Pending “Weight modal keyboard” item notes Feature 032; `docs/README.md` catalog updated.
