/**
 * Fixed overview figures, ported verbatim from design/canvas/erp-data.js
 * (UZ_HOME, UZ_SALES, UZ_PRODUCTS + PR, UZ_PRODTREND, and the fixed parts of UZ_STOCK).
 * These never change during a session (Clarification Q3, FR-005).
 */
import { P } from "./_helpers";

export const UZ_HOME = {
  banners: [
    ["Today sales", "KES 184K", "var(--green-600)", "file-text"],
    ["This week sales", "KES 1.12M", "var(--grey-900)", "refresh-cw"],
    ["This month sales", "KES 4.82M", "var(--banner-orange)", "calendar"],
    ["Annual sales", "KES 38.6M", "var(--info)", "chart-column"],
  ],
  kpis: [
    ["Total revenue", "KES 4.82M", "▲ 12.4% vs last 30 days"],
    ["Total expenses", "KES 3.51M", "▲ 4.2% vs last 30 days"],
    ["Net profit", "KES 1.31M", "▲ 8.1% after adjustments"],
    ["Customers", "1,233", "▲ 2.1% active"],
    ["Suppliers", "18", "on record"],
    ["Stock value", "KES 2.65M", "inventory valuation"],
    ["Low stock items", "14", "restock signals"],
  ],
  compare: { l: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], a: [3.1, 3.4, 3.9, 4.1, 4.29, 4.82], b: [2.1, 2.3, 2.8, 2.6, 3.0, 3.4], max: 5, aName: "Sales", bName: "Purchases" },
  cash: { l: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], a: [3.3, 3.6, 4.1, 4.3, 4.5, 5.0], b: [2.6, 2.9, 3.2, 3.1, 3.4, 3.7], max: 6, aName: "Inflow", bName: "Outflow" },
  expenses: [
    ["Rent, Nairobi HQ", "Expense, 1 Nov 2026", "185,000"],
    ["Electricity", "Expense, 30 Oct 2026", "42,300"],
    ["Delivery fuel", "Expense, 28 Oct 2026", "18,650"],
  ],
  stock: { turnover: "18%", soldToday: 12, low: "14", out: "3" },
  customers: [
    ["New this month", 26],
    ["Returning", 412],
    ["On credit", 18],
  ],
  payments: [
    ["M-Pesa", 2410000],
    ["Cash", 1230000],
    ["Card", 720000],
    ["Bank transfer", 460000],
  ],
  suppliers: [
    ["Eastside Bicycle Supplies", 14, 1921482],
    ["WholeCycle Wholesales", 9, 992525],
    ["Road & Travel Tyres", 6, 333973],
    ["Magaliesburg Wheels", 4, 228000],
  ],
} as const;

export const UZ_SALES = {
  kpis: [
    ["Today’s sales", "KES 184K", "▲ 6% vs yesterday"],
    ["Monthly revenue", "KES 4.82M", "▲ 12.4% vs last month"],
    ["Average order value", "KES 4,380", "▲ 3% vs last month"],
    ["Total customers", "1,233", "▲ 2.1% new this month"],
  ],
  channels: [
    ["POS", 2050000],
    ["Invoice", 1330000],
    ["Ecommerce", 1440000],
  ],
  orders: { total: "1,100", returns: "12", voids: "3", free: "5" },
  trend: { l: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], v: [3.1, 3.4, 3.9, 4.1, 4.29, 4.82], max: 5 },
  categories: [
    ["Parts", 2620000],
    ["Apparel", 1240000],
    ["Acrylic Paints", 580000],
    ["Services", 380000],
  ],
  boards: [
    { t: "Sales by area", h: "Area", n: "Orders", rows: [["Nairobi", 598, 2620000], ["Mombasa", 192, 840000], ["Kiambu", 119, 520000], ["Kisumu", 105, 460000], ["Nakuru", 86, 380000]] },
    { t: "Top products", h: "Product", n: "Sold", rows: [["Carbon Road Frame", 38, 1311000], ["Aluminium Frame", 26, 807300], ["Racing Wheelset", 41, 565800], ["Carbon Sole Shoes", 96, 397440], ["Helmet", 120, 196680], ["Groupset", 22, 185944]] },
    { t: "Top customers", h: "Customer", n: "Orders", rows: [["Walk-in customers", 640, 1420000], ["Apex Solutions", 12, 1167000], ["Morningview Bicycles", 18, 612400], ["Alpha Systems", 7, 286000], ["Tech Innovators", 5, 198500], ["Mountain Goats", 9, 96000]] },
    { t: "Top branches", h: "Branch", n: "Orders", rows: [["Nairobi HQ", 762, 3340000], ["New Jersey", 196, 860000], ["New York", 142, 620000]] },
    { t: "Top sales staff", h: "Staff", n: "Orders", rows: [["Peter Roadie", 276, 1210000], ["Jane Smith", 192, 840000]] },
    { t: "Top campaigns", h: "Campaign", n: "Orders", rows: [["Back to school", 96, 420000]] },
    { t: "How campaigns reached them", h: "Sent by", n: "Orders", rows: [["SMS", 58, 248000], ["Email", 38, 172000]] },
  ],
} as const;

/** Products overview, this month. Rows: [name, units sold, amount in KES]. */
export const PR = [
  ["Carbon Road Frame", 38, 1311000],
  ["Aluminium Frame", 26, 807300],
  ["Racing Wheelset", 41, 565800],
  ["Carbon Sole Shoes", 96, 397440],
  ["Helmet", 120, 196680],
  ["Groupset", 22, 185944],
  ["Custom Jersey", 84, 126000],
  ["Bike Pump", 210, 72450],
  ["Muthokinju Paint", 140, 65380],
  ["Skateboard", 18, 54000],
] as const;

export const UZ_PRODTREND = [
  ["Jun", 540],
  ["Jul", 610],
  ["Aug", 580],
  ["Sep", 720],
  ["Oct", 760],
  ["Nov", 795],
] as const;

export const UZ_PRODUCTS = {
  highlights: [
    ["Best seller", "Bike Pump", "210 sold"],
    ["Best category", "Parts", "337 sold"],
  ],
  bars: [
    { t: "Sales by product", sub: "KES, this month", max: 1500000, step: 500000, rows: PR.map((r) => [r[0], r[2]] as const) },
    { t: "Units sold by product", sub: "This month", max: 250, step: 50, rows: PR.map((r) => [r[0], r[1]] as const).sort((a, b) => b[1] - a[1]) },
  ],
  categories: [
    ["Parts", 2620000],
    ["Apparel", 1240000],
    ["Acrylic Paints", 580000],
    ["Services", 380000],
  ],
  boards: [{ t: "Best selling products", h: "Product", n: "Sold", rows: PR.slice(0, 6) }],
} as const;

/** Fixed parts of UZ_STOCK (the movement list is live and lives in fixtures/stock.ts). */
export const UZ_STOCK_FIXED = {
  low: [
    ["Carbon Frame", "Finished Goods", "135", "40", P("Healthy", "good")],
    ["Skateboard", "Stores", "35", "50", P("Low", "warn")],
    ["Knee pads", "Stores", "0", "10", P("Buy more", "warn")],
    ["Laser Printer", "Office", "0", "5", P("Out", "bad")],
  ],
  kpis: [
    ["Total stock value", "KES 2.65M", "Live valuation"],
    ["Low stock items", "14", "Needs attention"],
    ["Total products in stock", "248", "Active items"],
  ],
  week: { l: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], inn: [12, 0, 20, 0, 50, 8, 0], out: [6, 9, 4, 12, 8, 10, 3], max: 60, step: 20 },
  categories: [
    ["Parts", 58],
    ["Apparel", 24],
    ["Acrylic Paints", 12],
    ["Services", 6],
  ],
} as const;
