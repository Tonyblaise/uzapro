# Implementation Plan: The till uses the saved M-Pesa set-up

**Spec**: [spec.md](./spec.md) · **Date**: 2026-11-15

## Summary

One pure rule, `mpesaRoute(integrations, terminalId)`, decides where a terminal's M-Pesa request goes or why it can't be sent. The checkout dialog reads it through a hook; `requestMpesa` checks it again. No new state.

## Technical Context

Same stack as feature 015. No new dependencies, no Next.js APIs, no new storage.

## Constitution Check

| Principle | Result |
|---|---|
| I. Design fidelity | Deviation recorded in spec › Design deviations. |
| II. Data behind `src/data` | Pass. The dialog imports only from `@/data`; nothing is sent. |
| III. No persisted business data | Pass. No new state or storage. |
| IV. Design system | Pass. No new styles. |
| V. Routing and structure | Pass. No new routes or folders. |

## Project Structure

```
src/data/types/integrations.ts       MpesaRoute
src/data/integrations.ts             mpesaRoute, mpesaRouteNote
src/data/queries-integrations.ts     useTillMpesa
src/data/commands/pos.ts             requestMpesa checks the route
src/data/index.ts                    exports mpesaRouteNote
src/features/pos/Dialogs.tsx         checkout: phone and Send request only when ready
tests/unit/integrations.test.ts, integrations-commands.test.ts
tests/smoke/till-mpesa.spec.ts
```
