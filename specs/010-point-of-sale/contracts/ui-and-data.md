# Contract: Point of Sale UI and data access

## Routes

| Path | Shows |
|---|---|
| `/point-of-sale` → `/point-of-sale/terminals` | The terminal cards |
| `/point-of-sale/terminals?till=1` | The full-screen till for terminal 1 (shift, PIN or app step) |
| `?till={unknown or inactive id}` | The terminal cards |

- The sidebar's Sales section shows "Point of sale" (scan-barcode) after Sales.
- The Owner and the Cashier can see it.

## UI surface

| Element | Accessible name / role | Notes |
|---|---|---|
| Terminal card button | "Continue selling" / "Open shift" / "Terminal is off" (disabled) | |
| Manage terminals | link-styled button "Manage terminals" | Goes to Settings › Terminals |
| Exit (shift and PIN steps) | button "Back to UzaPro" | |
| Opening cash | textbox "Opening cash in the drawer (KES)"; buttons "KES 1,000"…; "Open shift" / "Continue to PIN" | |
| Seller | buttons per person, with `aria-pressed` | |
| PIN pad | group "Enter your PIN"; buttons "1"–"9", "0", "Clear", "Delete" | Keyboard: digits, Backspace, Escape |
| Rail | nav "Point of sale"; buttons "Sell", "Today", "Orders", "People", "Shift" (`aria-current`); "Settings", "Lock", "Exit" | The Orders badge shows the number of held sales |
| Search | textbox "Search" | Placeholder depends on the view |
| Category chips | buttons "{category} {n}" with `aria-pressed` | |
| Product tile | button "Add {product}" | |
| Customer | button "{customer} … Change" | Opens "Who is this sale for?" |
| Barcode | textbox "Barcode" | Enter runs the lookup |
| Cart line | buttons "Fewer", "More", "Note" / "Edit note" / "Done", "Remove"; textbox "Item note" | |
| Discount | button "+ Add" / "−KES …"; textbox "Discount"; button "KES" / "%"; button "Done" | |
| Hold / Charge | buttons "Hold", "Charge {total}" | Disabled when the cart is empty |
| Cart toggle (below 860px) | button "{n} items" | |
| Variant dialog | dialog "{product}"; option buttons; "Fewer" / "More"; textbox "Quantity"; "Cancel"; "Add {qty} · KES {amount}" | |
| Customer dialog | dialog "Who is this sale for?"; textbox "Search customers"; "Walk-in customer"; customer buttons; "New customer"; "Cancel" | |
| New customer dialog | dialog "New customer"; textboxes "Name", "Phone number"; "Save and select" | |
| Checkout dialog | dialog "Checkout"; method buttons "Cash" / "M-Pesa" / "Card" / "Pay later" with `aria-pressed`; textbox "Amount"; keypad buttons; quick amounts; "Customer's phone"; "Send request"; "M-Pesa code" / "Card reference (optional)"; "Sale note"; "Remove payment"; "Add as part payment and split the rest"; toggles "Print" / "SMS" / "Email"; "Complete sale" / "Take payment first" / "Complete on credit" | |
| Receipt dialog | dialog "Sale complete" / "Receipt {ref}"; "Print", "Send", "New sale" / "Done" | |
| Settings | dialog "Terminal settings"; six switches; textbox "New quick note"; "Add note"; "Remove note" | |
| Close shift | dialog "Close shift"; textbox "Cash you counted (KES)"; "Note (optional)"; "Cancel"; "Close shift" | |

## Data access (`@/data`)

```ts
// queries
usePos(): PosState; usePosTerminal(id): Terminal | undefined; usePosProducts(store): PosProduct[];
usePosShiftDocs(termId): PosSaleDoc[];

// commands (src/data/commands/pos.ts)
launchTill(id); exitTill(); setPosStep(s); openShift(); continueToPin(); pickSeller(name);
pressPin(key); lockTill(); setPosView(v); setPosQuery(q); setPosCategory(c);
tapProduct(name); chooseVariant(v); setVariantQty(q); addVariantToCart();
changeLine(i, delta); removeLine(i); clearCart(); setLineNote(i, note); toggleNoteLine(i);
setDiscount(val); toggleDiscountType(); setDiscountOpen(b); scanCode(code);
holdSale(); resumeHeld(i); discardHeld(i);
openCustomerPicker(); pickCustomer(name); setCustomerQuery(q); openNewCustomer(); setNewCustomer(p); saveNewCustomer();
charge(); setPayMethod(m); setPayAmount(s); pressCashKey(k); setPayRef(s); setPayPhone(s); requestMpesa();
addPartPayment(); removePayment(i); setSaleNote(s); toggleNotify(k); completePosSale();
openReceipt(ref); closeModal(); receiptNext(); printReceipt(); sendReceipt();
askCloseShift(); setCloseCount(s); setCloseNote(s); confirmCloseShift();
openPosSettings(); togglePosSetting(k); addQuickNote(); removeQuickNote(i); setQuickNoteDraft(s); toggleCart();

// pure helpers (unit tested): posTotals, quickCash, productCode, matchCode, shiftCollections,
// expectedCash, closeDiff, todayStats, onShiftLabel
```

## Changes to existing code

- `types/common.ts`: `ModuleId` gains `"pos"`. `types/config.ts`: `ScreenKind` gains `"poslaunch"`.
  `types/accounts.ts`: `LedgerKind` gains `"Sale"`.
- `config/modules.ts`: the `pos` module. `config/roles.ts`: the Cashier's `mods` gains `"pos"`.
- `fixtures/stock.ts`: 5 new `STOCK_LINES`. `fixtures/catalog.ts`: `PRODUCT_ROWS` statuses per the
  new `erp-data.js`.
- `queries-stock.ts`: export the variant-stock helper.
- `components/ui/Icon.tsx`: `scan-barcode` and `credit-card` (if missing).
- `features/screens.ts`: the `pos` screens. The shell hides the Uza AI launcher while `?till` is set.
- `styles/tokens.css`: `--pos-tint-*`, `--pos-ink-*`, `--pos-avatar-*`, `--receipt-paper`.
  `styles/globals.css`: `.uz-ptile`, `.uz-key`, `.uz-orow`, `.uz-switch`, `.uz-shake` and the POS
  breakpoints.
