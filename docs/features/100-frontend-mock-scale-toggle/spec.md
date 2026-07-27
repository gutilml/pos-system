# Feature: Frontend mock scale (dev/settings toggle)

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Cashiers without a physical USB/serial scale still hit Web Serial `port.open` failures when `WeightModal` auto-reads (Feature 099). This feature adds an in-app **Mock scale** toggle under Settings so the weight modal auto-fills a deterministic fake weight with **no Web Serial and no virtual COM port**. Manual keyboard/numpad entry remains available. Scope is frontend-only; the toggle is client-local (not a store API setting).

## User Stories

* As a developer or cashier without hardware, I want a Settings toggle for a mock scale so that weight items can be exercised end-to-end without a physical scale or COM emulator.
* As a cashier with Mock scale on, I want the weight modal to auto-fill a fake weight so that I can confirm and add the line without seeing serial open errors.
* As a cashier with Mock scale off, I want existing Feature 099 Web Serial pairing and auto-read behavior unchanged so that real scales keep working.

## Acceptance Criteria

1. [x] Settings → Scale section includes a **Mock scale** toggle (EN/ES). When on, preference persists in `localStorage` across reloads on that browser profile.
2. [x] With Mock scale **on**, opening `WeightModal` auto-fills a fixed fake weight (`MOCK_SCALE_WEIGHT = 1`) **without** calling `navigator.serial` / `readScaleWeight` / `port.open`.
3. [x] With Mock scale **on**, **Read from Scale** fills the same fake weight (no Web Serial); the button is enabled even if Web Serial is unsupported.
4. [x] With Mock scale **on**, the register `ScaleConnectBanner` does not prompt to pair hardware; Settings still exposes Connect/Reconnect for when mock is turned off.
5. [x] With Mock scale **off**, Feature 099 behavior is unchanged: auto-read via `readScaleWeight({ allowPrompt: false })`, manual read with `allowPrompt: true`, banner/pairing as today.
6. [x] Numpad and keyboard entry still work with mock on or off; user can overwrite the fake weight before Confirm.
7. [x] Vitest covers: mock on → auto-fill without `readScaleWeight`; mock off → existing auto-read path; preference persistence; EN/ES keys present.
8. [x] Triad + `docs/README.md` catalog row; no backend changes.
