# Feature: Backend parent pc no weight child

## Global rules

Ensure you adhere to our global rules in `PROJECT_CONTEXT.md` and `.cursorrules`.

## Description

Reject create/update when `parentProductId` points to a parent whose package unit is `pc` (or `pza`) and `sellByWeight` is true.

## Acceptance Criteria

1. [x] `BusinessRuleException` when pc parent + sellByWeight.
2. [x] Non-pc parents still allow sellByWeight.
3. [x] JUnit coverage.
