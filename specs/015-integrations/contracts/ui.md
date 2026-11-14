# Contract: UI (integrations)

Routes: `/integrations/m-pesa-daraja`, `/integrations/m-pesa-bank-integrations`, `/integrations/quickbooks`. `/integrations` redirects to the first tab the role can see.

## Shared (`src/features/integrations/shared.tsx`)

- `SectionHead`: h2, description, and a list labelled "Set-up status" of pills. Each pill carries hidden text ": done" or ": not yet".
- `ScopeSelect`: "Applies to", required, first option "Choose what this applies to".
- `SecretInput`: password field with Show / Hide. Placeholder "Saved. Type a new one to replace it" once saved.
- `CopyField`: read-only field and a "Copy {label}" button, disabled until there is a value. Secret values show as dots.

## M-Pesa (Daraja)

Pills: Configured, Connection tested, Payment URLs registered.

Cards, in order:

1. **M-Pesa account**: Environment, Account type; Paybill number, or Store number (head office) and Till number.
2. **Account numbers (optional)** (Paybill): Account number; "Per-terminal account numbers" with Add terminal (scope all terminals, or none chosen).
3. **Daraja API keys**: Consumer key, Consumer secret, Lipa na M-Pesa Online passkey.
4. **Initiator (optional)**: Initiator name, Initiator password.

Footer (Write only): Test connection, Register payment URLs, Save credentials. With unsaved edits to a saved config: "Save your changes before you test them."

## M-Pesa bank integrations

Bank tiles (`aria-pressed`), each with "Configured" or "Not configured". Then Applies to, the bank's `SectionHead` (Configured, Connection tested), its feature pills, and cards:

1. **Environment**
2. **STK push API**: API username, API secret key (created), Paybill number (fixed), {bank} till number.
3. **Payment notifications**: Notification URL, username, password, secret key (created).
4. **QR code**: QR till code.

Footer (Write only): Test connection, Save credentials.

## QuickBooks

Pills: Connected, Synced.

- **Not connected**: card "Connect your QuickBooks company" with Environment and Connect QuickBooks (Write only).
- **Connected**, cards in order:
  1. **Connection**: Company, Company ID, Environment, Last sync.
  2. **What to send**: five checkboxes.
  3. **QuickBooks accounts**: one select per ticked record kind that needs an account.
  4. **When to send**: Send to QuickBooks.

Footer (Write only): Disconnect (Delete only, confirmed in a dialog "Disconnect QuickBooks?"), Sync now, Save settings. With unsaved edits: "Save your changes before you sync."

## Access

Without Write: fields disabled, footer and Add terminal hidden.

## Layout

Field grids are one column below `sm`, two from `sm`. No horizontal page scroll at 390px.
