# UI Contract: Routes, actions and role visibility

The URLs below are the app's public surface. Deep links, quick tasks and smoke tests all
depend on them.

## Routes

| Path | Screen | Notes |
|---|---|---|
| `/` | redirect | To `/dashboard` when signed in, otherwise `/login`. |
| `/login` | Login, Forgot password, Check your messages | The view switches in-page (`?view=forgot`/`sent` optional). Signed-in visitors go to `/dashboard`. |
| `/dashboard` | Dashboard (`home` › Overview) | |
| `/products` → `/products/overview` | Products | Tabs: `overview`, `all-products`, `categories`, `units-of-measure` |
| `/stock` → `/stock/overview` | Stock | Tabs: `overview`, `stock-management`, `transfer-stock`, `wastage`, `warehouses` |
| `/sales` → `/sales/overview` | Sales | Tabs: `overview`, `all-sales`, `quotations`, `invoices`, `refunds-credit-notes`, `voided-items`, `sales-targets` |
| `/customers` → `/customers/customers` | Customers | Tab: `customers` |
| `/{purchases,suppliers,accounts,expenses,receivables,payables,reports,team,permissions,calendar,messages,file-manager,help,profile,settings}` | Placeholder | "Not built yet in this prototype." Any `/{module}/{tab}` under these also shows the placeholder. |

`/{module}` redirects to the role's **first visible** tab (e.g. a Cashier opening `/sales`
lands on `/sales/all-sales`).

## Guards

1. Signed out and not on `/login` → `/login`.
2. A module not in `visibleModules(role)` → `/dashboard`.
3. A tab not in `visibleTabs(role, module)` → `/dashboard`.
4. An unknown module or tab slug → 404 page.

## Search-param actions (open a drawer or modal on top of the tab)

| Param | Valid on | Opens |
|---|---|---|
| `?action=new` | `/sales/all-sales` | New sale |
| `?action=invoice` | `/sales/invoices` | New invoice |
| `?action=quote` | `/sales/quotations` | New quotation |
| `?action=credit` | `/sales/refunds-credit-notes` | New credit note (pick the source sale) |
| `?action=stock` | `/stock/stock-management` | Add stock |
| `?action=transfer` | `/stock/transfer-stock` | New transfer |
| `?action=waste` | `/stock/wastage` | Record wastage |
| `?action=new` | `/products/all-products`, `/products/categories`, `/products/units-of-measure`, `/customers/customers` | New product, category, unit or customer |
| `?view=<ref>` | any list tab | Record view (sale, transfer, credit note, product…) |

Closing the overlay removes the param, using `router.replace` with no history entry.

## Role visibility (from `UZ_ROLES`, in-scope modules only)

| Role (login email prefix) | Dashboard | Products | Stock | Sales tabs | Customers |
|---|---|---|---|---|---|
| Owner (anything else) | ✓ | all 4 | all 5 | all 7 | ✓ |
| Accountant (`mary…`) | ✓ | — | — | overview, all-sales, invoices, refunds-credit-notes, voided-items, sales-targets | ✓ |
| Cashier (`jane…`) | ✓ | — | stock-management only | all-sales, refunds-credit-notes | ✓ |
| Store keeper (`grant…`) | ✓ | all 4 | all 5 | — | — |

The out-of-scope modules each role sees are listed in the sidebar and open the placeholder.

## Additional search params added during implementation

| Param | Where | Opens |
|---|---|---|
| `?edit=<name>` | `/products/all-products` | Product form in edit mode |
| `?action=new&parent=<category>` | `/products/categories` | New sub-category |
| `?view=<name>` | `/products/categories`, `/products/units-of-measure` | Edit category / unit |
| `?view=<product>&store=<store>` | `/stock/stock-management` | Stock history for a product in a store |
| `?view=<ref>&cancel=1` | `/stock/transfer-stock` | Cancel-transfer step |
| `?view=<ref>&confirm=delete` | `/stock/wastage` | Delete wastage confirm |
| `?action=warehouse`, `?view=<name>` | `/stock/warehouses` | New / edit warehouse |
| `?view=<ref>&step=void\|credit` | `/sales/all-sales` | Void form / credit-note form from a sale |
| `?edit=<ref>`, `?convert=<ref>` | `/sales/quotations`, `/sales/invoices` | Edit document / convert quotation to invoice |
| `?action=new` | `/sales/sales-targets` | New target |
