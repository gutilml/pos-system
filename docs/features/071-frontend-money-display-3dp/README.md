# Feature 071 — Frontend money display 3 decimals

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Status

**Done** — `MONEY_DISPLAY_SCALE = 3`; payment modal uses `formatMoney`. **Superseded by Feature [093](../093-frontend-money-display-2dp/README.md)** (restore 2 dp display + payable rounding).

## Summary

Change UI currency formatting from **2** to **3** decimal places via central `formatMoney`. Internal `roundMoney` stays at **4** scale. Supersedes Feature **033** display scale only.

## Out of scope

* API/DB money scale; quantity/weight field formatting.
