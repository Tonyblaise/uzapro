# Data model: Integrations

Types in `src/data/types/integrations.ts`. State at `AppState.integrations`.

## IntegrationsState

| Field | Type | Notes |
|---|---|---|
| daraja | `DarajaConfig[]` | At most one per scope |
| bank | `BankConfig[]` | At most one per bank and scope |
| quickbooks | `QuickbooksConnection \| null` | null until connected |

`IntegrationScope = "all" | number` (a terminal id).

## DarajaConfig

| Field | Type | Notes |
|---|---|---|
| scope | `IntegrationScope` | |
| env | `"production" \| "sandbox"` | |
| accountType | `"paybill" \| "till"` | |
| paybill | string | Paybill only, digits |
| storeNumber, tillNumber | string | Till only, digits |
| accountNumber | string | Paybill only; "" uses each sale's number |
| terminalAccounts | `{ terminalId, accountNumber }[]` | Paybill and scope `"all"` only; a terminal once |
| initiatorName | string | Optional |
| secretsSet | `{ consumerKey, consumerSecret, passkey, initiatorPassword }` booleans | The values are never stored |
| tested | boolean | Reset by every save |
| urlsRegistered | boolean | Reset by every save; needs `tested` |

## BankConfig

| Field | Type | Notes |
|---|---|---|
| scope | `IntegrationScope` | |
| bank | `"ncba"` | |
| env | `"production" \| "sandbox"` | Must be one the bank offers |
| tillNumber | string | Required, digits |
| qrTillCode | string | Optional, 20 characters or fewer |
| generated | `BankGenerated` | Created on the first save, then kept |
| tested | boolean | Reset by every save |

`BankGenerated`: apiUsername, apiSecret, notifyUrl, notifyUsername, notifyPassword, notifySecret.

## QuickbooksConnection

| Field | Type | Notes |
|---|---|---|
| env | `"production" \| "sandbox"` | Chosen when connecting |
| companyName, companyId | string | The business name and a demo ID |
| settings.send | `Record<QbRecord, boolean>` | invoices, payments, customers, products, expenses; at least one |
| settings.incomeAccount, depositAccount, expenseAccount | string | Needed when invoices, payments, expenses are sent |
| settings.frequency | `"manual" \| "hourly" \| "daily"` | |
| lastSync | `{ at, counts } \| null` | Display date and time; a count per record kind sent |

## Reference data (`src/data/fixtures/integrations.ts`)

- `INTEGRATION_ENVS`: Production (live), Sandbox (test).
- `DARAJA_ACCOUNT_TYPES`: Paybill, Till (Buy Goods).
- `QB_RECORDS`, `QB_FREQUENCIES`, `QB_ACCOUNTS`, `QB_ACCOUNT_LABEL`: what QuickBooks can be sent, how often, and the demo chart of accounts.
- `INTEGRATION_BANKS`: NCBA Bank, paybill 880100, features STK push / Payment notifications / QR code, environments: production.

## Seed

`{ daraja: [], bank: [], quickbooks: null }`.

## Other changes

- `ModuleId` gains `"intg"`.
- Generic fixture keys `set/connected-apps` and `set/import-and-export` are removed.
