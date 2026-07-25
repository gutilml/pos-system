# Feature: Frontend friendly login error

## Description

Show a clear EN/ES message when login credentials are wrong instead of raw Problem Details JSON.

## Acceptance Criteria

1. [x] `formatApiErrorBody` / `parseJson` prefer `detail`.
2. [x] LoginForm shows i18n invalid-credentials message.
3. [x] Vitest + pending + catalog updated.
