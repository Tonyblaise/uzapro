# Contract: Data-access additions (`@/data`)

This extends the feature 001 and 002 contracts. UI imports only `@/data`; commands return
`Promise<Result<T>>` with the design's message.

## Reads

```ts
useReceivables(): ReceivableRow[]          // with balance + status
usePayables(): PayableRow[]                // with balance + status + approval
useCustomerPayments(): Payment[]; useSupplierPayments(): Payment[]
useBulkPayments(side: "rcv" | "pay"): Payment[]
useCustomerPlans(): Plan[]; useSupplierPlans(): Plan[]
useCustomerCredits(): CreditRow[]; useSupplierCredits(): CreditRow[]   // with left + status
useOpenItems(side, party): (ReceivableRow | PayableRow)[]             // oldest due first; payables: Approved only
useUsableCredit(side, party): number
useAgeing(side, filter?): AgeingRow[]                                  // statement / supplier ageing
// pure helpers: balance, rcvStatus, payStatus, ageBucket (src/data/money.ts)
```

## Commands

```ts
recordPayment(side: "rcv" | "pay", input: NewPayment): Promise<Result<Payment>>   // "{PAY} saved. KES {n} applied to {refs}."
verifyPayment(side, ref): Promise<Result<Payment>>                                // "{ref} verified."
toggleReceivablePriority(ref): Promise<Result<void>>
approvePayable(ref): Promise<Result<void>>                                       // "{ref} approved for payment."
rejectPayable(ref): Promise<Result<void>>                                        // "{ref} rejected."
createPlan(side, input: NewPlan): Promise<Result<Plan>>                           // "{ref} created for {party}."
cancelPlan(side, ref): Promise<Result<Plan>>                                      // "{ref} cancelled."
issueCredit(side, input: NewCredit): Promise<Result<Credit>>                       // "{ref}: KES {n} credit for/from {party}."
voidCredit(side, ref): Promise<Result<Credit>>                                    // "{ref} voided."
generateStatement(filter): Promise<Result<void>>                                  // "Statement updated."

// Internal hooks used by existing commands (features 001/002)
addReceivable(state, input): { state, ref }      // recordSale (credit), createInvoice
closeReceivableFor(state, doc): state            // voidSale (FR-016b)
addPayable(state, input): { state, ref }         // receiveGoods (unpaid)
addCustomerCredit(state, input): { state, ref }  // approveCreditNote with money back = credit (FR-016c)
```

## Invariants

- Σ allocation = amount ≤ Σ selected balances. Credit payments are ≤ usable credit and consume
  credits oldest first.
- Only Approved payables are payable. Voided receivables are never offered.
- References follow `nextRef` per list (`RCV-`, `PAY-`, `PLN-`, `CRD-`, `PYB-`, `VPMT-`, `PPL-`,
  `SCR-`).
- No account balances change (FR-019).
