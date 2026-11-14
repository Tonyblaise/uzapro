# Contract: data access (pricing and credit)

Components import only from `@/data` (Principle II).

## Pure helpers

`src/data/pricing.ts`

```ts
export const RETAIL_GROUP = "g-retail";
export function unitsOf(v: Variant): string[];                       // base unit first
export function standardPrice(v: Variant, unit: string): number;     // research R3
export function findEntry(prices: readonly PriceEntry[], group: string, product: string, variant: string, unit: string): PriceEntry | undefined;
export function breakFor(entry: PriceEntry, qty: number): PriceBreak | undefined;   // highest from ≤ qty
export function priceFor(a: { prices: readonly PriceEntry[]; group: string; product: string; variant: Variant; unit: string; qty: number }): LinePrice;
export function validateEntry(e: PriceEntry, prices: readonly PriceEntry[], editing?: PriceEntry): string | null;
export function validateGroupName(name: string, groups: readonly CustomerGroup[], exceptId?: string): string | null;
```

`src/data/credit.ts`

```ts
export const PAY_TERMS: readonly PayTerms[];                          // Cash, 7 days, 14 days, 30 days
export function termDays(t: PayTerms): number;                        // 0, 7, 14, 30
export function creditPosition(c: Pick<Customer, "name" | "creditLimit" | "terms">, receivables: readonly Receivable[], today?: string): CreditPosition;
export function creditStop(position: CreditPosition, creditAmount: number): CreditStop | null;
export function creditFlag(position: CreditPosition): "Over limit" | "Overdue" | null;
```

## Read hooks (`src/data/queries-pricing.ts`)

| Hook | Returns |
|---|---|
| `useCustomerGroups()` | `{ id, name, builtIn, customers, prices }[]` |
| `usePriceEntries(group?)` | entries, with `standard` and `higher` (above standard) added |
| `useGroupOf(customer)` | the customer's `CustomerGroup` (Retail when unknown) |
| `usePricer(customer)` | `(product, variant, unit, qty) => LinePrice` |
| `useCreditPosition(customer)` | `CreditPosition \| null` (null for walk-in or unknown) |
| `useCreditPositions()` | `Record<customerName, CreditPosition>` for the Customers table |
| `useCanApproveCredit()` | boolean: Write on Receivables |

## Commands

`src/data/commands/pricing.ts`: all return `Result` and set the toast.

```ts
addCustomerGroup(name: string): Promise<Result<CustomerGroup>>;          // "{Name} added."
renameCustomerGroup(id: string, name: string): Promise<Result<void>>;    // "{Name} saved."
deleteCustomerGroup(id: string): Promise<Result<void>>;                  // "{Name} deleted." | "Move {N} customers to another group first." ("1 customer" for one)
savePrice(entry: PriceEntry, editing?: PriceEntry): Promise<Result<void>>;   // "Price saved."
removePrice(entry: PriceEntry): Promise<Result<void>>;           // "Price removed."
```

Changed:

- `createCustomer` / `updateCustomer` accept `group`, `creditLimit`, `terms`. Existing toasts are
  kept ("{Name} added.", "{Name} saved.").
- `recordSale(input)`, `createInvoice(input)`: run `creditStop`. A stop without a valid approval
  returns `fail(message)` with `stop` on the result. With one, the sale or invoice carries
  `creditApproval`. The receivable is due after the customer's terms.
- `completePosSale()`: the same check on the credit part; the approval reason is held in the till
  checkout state (`co.approval`).
- Till cart commands (`addLine`, `changeLine`, `pickCustomer`, `resumeHeld`) reprice lines for the
  attached customer.

`Result` failures gain an optional `stop?: CreditStop`.

## Store

`AppState.pricing: PricingState`, from `seedPricing()` in `seed.ts`. Linked till tabs share it
through the existing linked store.
