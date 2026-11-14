# Data model: Stock counts

## StockCount (`types/stock.ts`, `AppState.stock.counts`)

`ref` (CNT-0001 …), `store`, `date` (ISO), `by`, `status` ("In progress" | "Waiting approval" |
"Approved" | "Cancelled"), `full` (every product at the store was included), `lines`,
`approvedBy?`, `approvedAt?`.

## CountLine

`product`, `system` (base units at the start), `counted` (`number | null`).

## Derived (`counts.ts`)

`variance(line)`, `countTotals(count, cost)` → `{ counted, lines, over, short, net, value }`,
`countStatus(count)` → pill (In progress: info; Waiting approval: warning; Approved: success;
Cancelled: neutral).

## Seed (new values)

CNT-0001, Point of Sale, 3 Nov 2026, by Grant Jensen, Approved by Tony Blaise on 3 Nov 2026,
16:40, Partial. Lines: Helmet system 46, counted 44 (−2); Bike Pump system 28, counted 28;
Groupset system 2, counted 3 (+1).
