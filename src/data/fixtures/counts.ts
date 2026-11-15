/**
 * Stock counts seed, ported from design/canvas/erp-data.js (`UZ_COUNTS`, design version
 * 1794713355-85bd). The design counts each variant; UzaPro keeps stock per product, so each
 * product's variants are added together: system figures summed, counted summed when every variant
 * was counted, notes kept with their variant (specs/025-stock-counts-design › Design deviations).
 * The design's "Tony Ashiuma" is the app's owner, Tony Blaise.
 */
import type { StockCount } from "../types";

export const COUNT_SEED: readonly StockCount[] = [
  {
    ref: "SC-0015",
    store: "Main Store",
    scope: "Parts",
    blind: true,
    date: "2026-11-10",
    by: "Grant Jensen",
    status: "Counting",
    lines: [
      { product: "Racing Wheelset", category: "Parts", variants: ["700c", "650b"], system: 16, counted: 15, note: "650b: One box damaged" },
      { product: "Bike Pump", category: "Parts", variants: ["Standard"], system: 30, counted: null, note: "" },
      { product: "Groupset", category: "Parts", variants: ["Standard"], system: 0, counted: null, note: "" },
    ],
    history: [{ when: "10 Nov 2026, 08:15", what: "Count started", who: "Grant Jensen" }],
  },
  {
    ref: "SC-0014",
    store: "Point of Sale",
    scope: "Everything",
    blind: true,
    date: "2026-11-09",
    by: "Jane Smith",
    status: "Waiting approval",
    submittedAt: "9 Nov 2026, 18:40",
    lines: [
      { product: "Carbon Sole Shoes", category: "Apparel", variants: ["Size 42", "Size 43"], system: 28, counted: 27, note: "" },
      { product: "Bike Pump", category: "Parts", variants: ["Standard"], system: 28, counted: 28, note: "" },
      { product: "Helmet", category: "Apparel", variants: ["Small", "Medium", "Large"], system: 44, counted: 43, note: "Medium: Found one in the back" },
    ],
    history: [
      { when: "9 Nov 2026, 17:55", what: "Count started", who: "Jane Smith" },
      { when: "9 Nov 2026, 18:40", what: "Submitted for approval. 2 differences", who: "Jane Smith" },
    ],
  },
  {
    ref: "SC-0013",
    store: "Main Store",
    scope: "Everything",
    blind: false,
    date: "2026-11-01",
    by: "Grant Jensen",
    status: "Approved",
    approvedAt: "1 Nov 2026, 17:20",
    approvedBy: "Tony Blaise",
    lines: [
      { product: "Carbon Road Frame", category: "Frames", variants: ["54cm", "56cm"], system: 35, counted: 35, note: "" },
      { product: "Aluminium Frame", category: "Frames", variants: ["54cm", "56cm"], system: 165, counted: 164, note: "54cm: Scratched, moved to wastage" },
      { product: "Carbon Sole Shoes", category: "Apparel", variants: ["Size 42", "Size 43"], system: 40, counted: 40, note: "" },
      { product: "Bike Pump", category: "Parts", variants: ["Standard"], system: 31, counted: 30, note: "" },
    ],
    history: [
      { when: "1 Nov 2026, 14:00", what: "Count started", who: "Grant Jensen" },
      { when: "1 Nov 2026, 16:45", what: "Submitted for approval. 2 differences", who: "Grant Jensen" },
      { when: "1 Nov 2026, 17:20", what: "Approved. Stock updated for 2 lines", who: "Tony Blaise" },
    ],
  },
];
