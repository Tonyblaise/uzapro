# Research: Integrations

## R1. Sub-navigation

**Decision**: flat tabs on the existing tab strip.
**Why**: every module uses it; the registry has no nested groups; the shell has no fly-out or icon rail. The user chose this over building a fly-out.

## R2. Where secrets live

**Decision**: typed secrets are discarded on save; state holds a flag per secret.
**Why**: "Saved keys are never shown again" is then true by construction, and a test can assert no secret is in state.
**Consequence**: a blank key field on a later save means "keep the saved one".

## R3. Bank-created credentials

**Decision**: created once per bank and scope by a repeatable function of the bank and the owner ("business" or the terminal code), and kept on later saves.
**Why**: the business copies them into a letter to the bank; they must not change when the till number is corrected. Repeatable values keep tests exact. These must stay in state because the copy button needs them; secret ones are masked on screen.

## R4. Scope model

**Decision**: one config per scope, where scope is `"all"` or a terminal id. Terminals without a config use the business-wide one.
**Why**: matches the reference's "Applies to" list and the existing `settings.terminals`.

## R5. Simulated requests

**Decision**: a 600 ms wait, then success, in the style of the till's `requestMpesa`. Test needs a saved config; Register needs a passed test; both re-check after the wait.
**Why**: Principle II forbids network calls; the ordering is still worth enforcing and testing.

## R6. Field-level errors

**Decision**: pure `darajaErrors` / `bankErrors` return a message per field. The screen shows them inline; the command uses the same function and fails with the first.
**Why**: a long form needs each message next to its field, and the command must not trust the screen.

## R7. Settings › Connected apps and Import and export

**Decision**: removed from the module registry, the generic screen map and the generic fixtures.
**Why**: first moved to Integrations, then the user asked for them to go. Both were placeholder generic screens with no behaviour behind them.
