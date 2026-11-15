# Contract: data access (till M-Pesa)

- `mpesaRoute(integrations, terminalId)` → `MpesaRoute` (`src/data/integrations.ts`; not exported to the UI).
- `mpesaRouteNote(route)` → the checkout note. Exported from `@/data`.
- `useTillMpesa()` → the open till's `MpesaRoute`. Exported from `@/data`.
- `requestMpesa()` → unchanged signature. Without a usable set-up it sets the checkout error to `mpesaRouteNote(route)` and starts nothing.
