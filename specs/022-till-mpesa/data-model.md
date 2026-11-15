# Data model: The till uses the saved M-Pesa set-up

No new state. One derived type in `src/data/types/integrations.ts`:

```ts
type MpesaRoute =
  | { ready: true; via: "daraja" | BankId; to: string }
  | { ready: false; reason: "none" | "untested" };
```

`to` is display text: "Paybill 522522, account FRONT", "Till 300300" or "NCBA Bank till 000001".

Paybill account for a terminal: its entry in `terminalAccounts`, then `accountNumber`, then "the sale number".
