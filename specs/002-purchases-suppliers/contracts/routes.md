# UI Contract: Purchases and Suppliers routes

This extends `specs/001-dashboard-sales-stock/contracts/routes.md`. The guards and the
`?action=` / `?view=` conventions are unchanged.

## Routes (now in scope)

| Path | Screen | Tabs |
|---|---|---|
| `/purchases` → first visible tab | Purchases | `overview`, `purchase-orders`, `goods-receipts`, `purchase-returns`, `rejected-items` |
| `/suppliers` → `/suppliers/suppliers` | Suppliers | `suppliers` |

## Search-param actions

| Param | Valid on | Opens |
|---|---|---|
| `?action=new` | `/purchases/purchase-orders` | New purchase order |
| `?edit=<ref>` | `/purchases/purchase-orders` | Edit purchase order |
| `?view=<ref>` | `/purchases/purchase-orders` | Purchase order view |
| `?view=<ref>&step=receive` | `/purchases/purchase-orders` | Receive goods for that order |
| `?view=<GRN>` | `/purchases/goods-receipts` | Goods receipt view |
| `?action=new` | `/purchases/purchase-returns` | New purchase return |
| `?view=<PRT>` | `/purchases/purchase-returns` | Purchase return view (Approve when waiting) |
| `?view=<REJ>` | `/purchases/rejected-items` | Rejected item view (sent back / replaced / write off) |
| `?action=new` | `/suppliers/suppliers` | New supplier |
| `?view=<name>` | `/suppliers/suppliers` | Edit supplier |

## Role visibility (from `UZ_ROLES`)

| Role | Purchases tabs | Suppliers |
|---|---|---|
| Owner | all 5 | ✓ |
| Accountant | overview, purchase-orders, purchase-returns, rejected-items | ✓ |
| Cashier | — | — |
| Store keeper | purchase-orders, goods-receipts, purchase-returns, rejected-items | ✓ |
