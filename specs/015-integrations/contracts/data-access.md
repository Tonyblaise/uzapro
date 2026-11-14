# Contract: data access (integrations)

Everything below is exported from `@/data`.

## Pure helpers (`src/data/integrations.ts`)

- `darajaErrors(input, saved, terminals)` → message per `DarajaField`; empty when valid.
- `bankErrors(input, terminals)` → message per `BankField`.
- `quickbooksErrors(settings)` → message per `QuickbooksField`; `syncSummary(counts)` → "12 invoices, 4 customers".
- `scopeValue(scope)` / `scopeFrom(value)` → select value and back; `""` is nothing chosen.
- `bankOf(id)`, `ALL_TERMINALS`.

Not exported to the UI: `scopeOptions`, `generateBankCredentials`, `seedIntegrations`.

## Hooks (`src/data/queries-integrations.ts`)

- `useDarajaConfig(scope)`, `useDarajaConfigs()`
- `useBankConfig(bank, scope)`, `useBankConfigs(bank)`
- `useIntegrationScopes(bank?)` → `{ value, label }[]`, business-wide first
- `useIntegrationTerminals()`
- `useQuickbooks()` → the connection or null

## Commands (`src/data/commands/integrations.ts`)

All return `Promise<Result<…>>` and toast on success.

| Command | Fails with | Success |
|---|---|---|
| `saveDarajaCredentials(input)` | the first field message (no toast) | "M-Pesa credentials saved."; resets `tested`, `urlsRegistered` |
| `testDarajaConnection(scope)` | "Save the credentials first." | "Connection works." |
| `registerDarajaUrls(scope)` | "Test the connection first." | "Payment URLs registered." |
| `saveBankCredentials(input)` | the first field message; "{bank} has no test environment" | "{bank} credentials saved."; creates credentials once |
| `testBankConnection(bank, scope)` | "Save the credentials first." | "Connection works." |
| `connectQuickbooks(env)` | "QuickBooks is already connected." | "Connected to {company} in QuickBooks." |
| `saveQuickbooksSettings(settings)` | "Connect QuickBooks first."; the first field message | "QuickBooks settings saved." |
| `syncQuickbooks()` | "Connect QuickBooks first." | "Sent to QuickBooks: {n} invoices, …." |
| `disconnectQuickbooks()` | "QuickBooks is not connected." | "QuickBooks disconnected." |

Test, register, connect and sync wait `INTEGRATION_WAIT_MS` and send nothing.

## Reference lists

`INTEGRATION_ENVS`, `DARAJA_ACCOUNT_TYPES`, `INTEGRATION_BANKS`, `QB_RECORDS`, `QB_FREQUENCIES`, `QB_ACCOUNTS`, `QB_ACCOUNT_LABEL`.
