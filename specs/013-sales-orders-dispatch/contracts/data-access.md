# Contract: data access (orders)

## Pure helpers (`src/data/orders.ts`)

```ts
export function leftToDispatch(l: OrderLine): number;
export function toInvoice(l: OrderLine): number;
export function orderStatus(o: SalesOrder): Pill;
export function deliveryStatus(d: DeliveryNote): Pill;
export function orderTotal(lines: readonly Pick<OrderLine, "qty" | "rate" | "taxable">[]): number;
export function checkDispatch(o: SalesOrder, qty: readonly number[], driver: string, vehicle: string): string | null;
export function canEditOrder(o: SalesOrder): boolean;      // nothing dispatched, not cancelled
```

## Hooks (`src/data/queries-orders.ts`)

`useOrders()` → orders with `status`; `useOrder(number)`; `useDeliveries()` → notes with `status`
and `items`; `useDelivery(number)`; `useOrderDeliveries(order)`.

## Commands (`src/data/commands/orders.ts`)

```ts
createOrder(input: NewOrder): Promise<Result<SalesOrder>>;                 // "{SO} saved."
updateOrder(number: string, input: NewOrder): Promise<Result<SalesOrder>>; // "{SO} saved."
cancelOrder(number: string): Promise<Result<void>>;                        // "{SO} cancelled."
dispatchOrder(input: NewDispatch): Promise<Result<DeliveryNote>>;          // "{DN} created. {n} items left {store}."
markDelivered(number: string, receivedBy: string): Promise<Result<void>>;  // "{DN} marked delivered."
invoiceOrder(number: string): Promise<Result<Invoice>>;                    // "{INV} saved. {RCV} added to Receivables."
```

`createOrder` fails with `stop` on a credit stop, like `createInvoice` (feature 012).
