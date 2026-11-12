/**
 * Typed port of the design's module registry `UZ_MODS` (design/canvas/erp-data.js), research R7.
 * Table rows live in src/data/fixtures; this file holds structure only.
 */
import type { Column, Module, ModuleId, ScreenKind, Section, Tab } from "@/data/types";

export function tabSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const N = (title: string): Column => ({ title, numeric: true });
const C = (title: string): Column => ({ title });

type TabDef = [title: string, kind: ScreenKind, columns?: Column[]];

function mod(
  id: ModuleId,
  section: Section,
  icon: string,
  name: string,
  subtitle: string,
  slug: string,
  tabs: TabDef[],
  inScope = false,
): Module {
  return {
    id,
    section,
    icon,
    name,
    subtitle,
    slug,
    inScope,
    tabs: tabs.map(([title, kind, columns]): Tab => ({ title, slug: tabSlug(title), kind, ...(columns ? { columns } : {}) })),
  };
}

export const MODULES: Module[] = [
  mod("home", "Overview", "house", "Dashboard", "Your day at a glance", "dashboard", [["Overview", "stats"]], true),
  mod(
    "prod",
    "Overview",
    "package",
    "Products",
    "What you sell and what it costs",
    "products",
    [
      ["Overview", "prodboard"],
      ["All products", "table", [C("Product"), C("Category"), N("Price"), N("On hand"), C("Status")]],
      ["Categories", "table", [C("Category"), C("Description")]],
      ["Units of measure", "table", [C("Unit")]],
    ],
    true,
  ),
  mod(
    "inv",
    "Overview",
    "boxes",
    "Stock",
    "What you have and where it is",
    "stock",
    [
      ["Overview", "stockboard"],
      ["Stock management", "table", [C("Product"), C("Store"), N("Quantity"), N("Stock value (KES)")]],
      ["Transfer stock", "table", [C("Ref"), C("From"), C("To"), N("Items"), C("Status")]],
      ["Wastage", "table", [C("Ref"), C("Item"), N("Qty"), C("Reason"), N("Value")]],
      ["Warehouses", "table", [C("Warehouse"), C("Branch"), C("Type"), N("Items")]],
    ],
    true,
  ),
  mod(
    "sales",
    "Sales",
    "shopping-cart",
    "Sales",
    "Record sales, send invoices and give refunds",
    "sales",
    [
      ["Overview", "salesdash"],
      ["All sales", "table", [C("Customer"), C("Type"), C("Channel"), N("Total"), C("Status")]],
      ["Quotations", "table", [C("Quotation #"), C("Customer"), C("Date"), C("Status"), N("Amount (KES)")]],
      [
        "Invoices",
        "table",
        [C("Invoice #"), C("Customer"), C("Invoice date"), C("Due date"), C("Status"), N("Amount (KES)"), N("Balance due (KES)")],
      ],
      [
        "Refunds (credit notes)",
        "table",
        [C("Credit note"), C("Customer"), C("Date"), C("Invoice"), C("Reason"), N("Amount (KES)"), C("Status")],
      ],
      [
        "Voided items",
        "table",
        [C("Void ref"), C("Original sale"), C("Customer"), C("Voided on"), C("Reason"), C("Voided by"), N("Amount (KES)")],
      ],
      [
        "Sales targets",
        "table",
        [C("Target"), C("Applies to"), C("Period"), N("Target (KES)"), N("Achieved (KES)"), C("Progress"), C("Status")],
      ],
    ],
    true,
  ),
  mod(
    "cust",
    "Sales",
    "users",
    "Customers",
    "The people and businesses you sell to",
    "customers",
    [["Customers", "table", [C("Name"), C("Phone"), C("Email"), C("Address"), C("Status")]]],
    true,
  ),
  mod("buy", "Procurement", "truck", "Purchases", "Order from suppliers and receive their goods", "purchases", [
    ["Overview", "buyboard"],
    ["Purchase orders", "table"],
    ["Goods receipts", "table"],
    ["Purchase returns", "table"],
    ["Rejected items", "table"],
  ]),
  mod("vend", "Procurement", "store", "Suppliers", "The businesses you buy from", "suppliers", [["Suppliers", "table"]]),
  mod("fin", "Financials", "calculator", "Accounts", "Bank accounts, mobile money and cash", "accounts", [
    ["Bank accounts", "table"],
    ["Deposits", "table"],
    ["Withdrawals", "table"],
    ["Transfers", "table"],
    ["Transactions", "table"],
  ]),
  mod(
    "exp",
    "Financials",
    "wallet",
    "Expenses",
    "Record what the business spends, set up repeat bills and sort spending into categories",
    "expenses",
    [
      ["Overview", "expboard"],
      ["Expenses", "table"],
      ["Recurring", "table"],
      ["Voided", "table"],
      ["Expense categories", "table"],
    ],
  ),
  mod(
    "rcv",
    "Financials",
    "banknote",
    "Receivables",
    "Money customers owe you, payments, payment plans and credits",
    "receivables",
    [
      ["Receivables", "table"],
      ["Payments", "table"],
      ["Payment plans", "table"],
      ["Customer credits", "table"],
      ["Bulk payments", "table"],
      ["Receivables statement", "table"],
    ],
  ),
  mod(
    "pay",
    "Financials",
    "landmark",
    "Payables",
    "Money you owe suppliers, approvals, payments, payment plans and supplier credits",
    "payables",
    [
      ["Payables", "table"],
      ["Payments", "table"],
      ["Bulk payments", "table"],
      ["Supplier credits", "table"],
      ["Supplier ageing", "table"],
      ["Payment plans", "table"],
    ],
  ),
  mod("rep", "Financials", "chart-column", "Reports", "See how the business is doing", "reports", [
    ["Popular", "cards"],
    ["Sales", "cards"],
    ["Money", "cards"],
    ["Stock", "cards"],
    ["Build a report", "form"],
    ["Sent automatically", "table"],
  ]),
  mod("ppl", "People", "users", "Team", "The people who work for you", "team", [["Team", "table"]]),
  mod("perm", "People", "sliders-horizontal", "Permissions", "What each role can see and do", "permissions", [["Permissions", "table"]]),
  mod("cal", "Office", "calendar", "Calendar", "What’s coming up for the business", "calendar", [["Calendar", "calendar"]]),
  mod("comm", "Office", "mail", "Messages", "Send SMS, email and WhatsApp", "messages", [
    ["Send message", "form"],
    ["Saved messages", "table"],
    ["Sent messages", "table"],
    ["Campaigns", "table"],
    ["Scheduled", "table"],
  ]),
  mod("docs", "Office", "folder", "File Manager", "Company files, organised by folder", "file-manager", [["All documents", "docs"]]),
  mod("sup", "Office", "circle-help", "Help", "Get answers and ask for help", "help", [
    ["Ask UzaPro", "chat"],
    ["How-to guides", "table"],
    ["Help requests", "table"],
    ["Response times", "table"],
  ]),
  mod("prof", "Account", "users", "Profile", "Your personal details, photo and password", "profile", [["Profile", "profile"]]),
  mod("set", "Account", "settings", "Settings", "Your business, branches, terminals and staff logins", "settings", [
    ["Business profile", "bizprofile"],
    ["Branches", "table"],
    ["Location groups", "table"],
    ["Storage locations", "table"],
    ["Terminals", "terminals"],
    ["Staff logins", "table"],
    ["Taxes", "table"],
    ["Connected apps", "table"],
    ["Import and export", "form"],
  ]),
];

export const SECTIONS: Section[] = ["Overview", "Sales", "Procurement", "Financials", "People", "Office", "Account"];

export function getModule(id: ModuleId): Module {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown module ${id}`);
  return m;
}

export function findModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function findTab(module: Module, slug: string): Tab | undefined {
  return module.tabs.find((t) => t.slug === slug);
}

export function findTabByTitle(module: Module, title: string): Tab | undefined {
  return module.tabs.find((t) => t.title === title);
}

/** URL for a module tab, optionally with a search-param action. */
export function hrefFor(moduleId: ModuleId, tabTitle?: string, params?: Record<string, string>): string {
  const m = getModule(moduleId);
  const base = moduleId === "home" ? "/dashboard" : tabTitle ? `/${m.slug}/${tabSlug(tabTitle)}` : `/${m.slug}`;
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  return base + qs;
}
