# Data Model: Run Reports

The types go in `src/data/types/office.ts`, the constants in `src/data/fixtures/reports.ts`, and the
logic in `src/data/reports.ts`. There's nothing new in the store except `ui.reportPeriod`.

## Types

```ts
type ReportPeriod = "This month" | "Last month" | "This year";

interface ReportColumn { t: string; num?: boolean; pct?: boolean }

/** A table cell: a raw number (formatted per column), text, or a styled label. */
type ReportCell = number | string | { text: string; bold?: boolean; right?: boolean };

interface ReportKpi { label: string; value: string; note?: string; tone?: "green" | "danger" | "info" | "warning" }

interface ReportResult {
  title: string;
  sub: string;                 // "This month · 1 Nov 2026 to 10 Nov 2026" | "As at 10 Nov 2026" | "All targets"
  asAt: boolean;               // true → no period picker
  kpis: ReportKpi[];
  cols: ReportColumn[];
  rows: ReportCell[][];
  total: ReportCell[] | null;  // bold last row
  empty?: string;              // shown when rows is empty
  note?: string;               // default: "Built from the sample data in UzaPro. …"
  missing?: boolean;           // the design's default branch → "Coming soon"
}

/** Store snapshot a report reads (research R2). */
interface ReportSource {
  receivables: ReceivableRow[]; payables: Payable[]; creditNotes: CreditNote[]; expenses: Expense[];
  accounts: Account[]; ledger: LedgerEntry[]; levels: StockLevel[]; movements: StockMovement[];
  wastage: Wastage[]; products: Product[]; targets: SalesTarget[]; sales: Sale[]; stores: Store[];
}

// ReportCard (existing) gains:
interface ReportCard { title: string; desc: string; runnable: boolean }
```

KPI tones map to the design's colours:

| Tone | Design colour | Class |
|---|---|---|
| green | `var(--green-700)` | `text-green-700` |
| danger | `var(--danger-text)` | `text-danger-text` |
| info | `var(--info-text)` | `text-info-text` |
| warning | `var(--warning-text)` | `text-warning-text` |
| (none) | `var(--text)` | `text-text` |

## Constants (`fixtures/reports.ts`)

- `REPORT_NAMES`: the 18 runnable names, in the design's `case` order.
- `REPORT_DESCRIPTIONS`: the 18 descriptions, copied exactly. Any other card reads "Not available
  yet".
- `REPORT_PERIODS`: the three periods with their date ranges and scale factors (research R3).
- `REPORT_FIXED`:

  | Field | Value |
  |---|---|
  | `salesMonth` | 4,820,000 |
  | `ordersMonth` | 1,100 |
  | `stockValue` | 2,650,000 |
  | `purchasesMonth` | 3,400,000 |
  | `cogsRate` | 0.58 |
  | `costRate` | 0.6 |
  | `vatRate` | 16/116 |
  | `asAt` | "2026-11-10" |
  | `onTrack` | 75 |

- `REPORT_DEFAULT_NOTE`: "Built from the sample data in UzaPro. Figures update as you record sales,
  expenses and payments."
- `REPORT_DEFAULT_EMPTY`: "Nothing to show for this period."

## Helpers (`reports.ts`)

| Helper | Returns |
|---|---|
| `repFmt(n)` | "−1,234" or "45,600" |
| `reportSlug(name)` / `reportFromSlug(slug)` | URL slug, and back to the name; `null` if unknown or not runnable |
| `periodSlug(p)` / `periodFromSlug(s)` | "this-month" ↔ "This month"; the default is "This month" |
| `runReport(name, period, src)` | `ReportResult` (one function per design `case`) |
| `reportCsv(result)` | `{ headers, rows }` for `copyCsv`: numbers rounded to 2 decimals, labels plain |
| `formatCell(cell, col)` | Display text: numbers through `repFmt` or "{n.toFixed(1)}%" |
| `targetAchieved(t, sales, stores)` (in `targets.ts`) | The target's base plus matching session sales |

## Validation and states

- A report name that isn't runnable, or an unknown slug, shows the cards (no error).
- An unknown period slug falls back to "This month".
- With no rows, the empty message shows, the total row is hidden (the design's `total: null` for
  these reports), and the KPIs still show.
