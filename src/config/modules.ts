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
  mod(
    "buy",
    "Procurement",
    "truck",
    "Purchases",
    "Order from suppliers and receive their goods",
    "purchases",
    [
      ["Overview", "buyboard"],
      ["Purchase orders", "table", [C("Supplier"), C("Ref"), N("Total"), C("Received"), C("Status")]],
      ["Goods receipts", "table", [C("Ref"), C("PO"), C("Supplier"), C("Location"), N("Lines"), C("Status")]],
      [
        "Purchase returns",
        "table",
        [C("Ref"), C("Supplier"), C("Purchase order"), C("Goods receipt"), C("Reason"), N("Qty"), N("Value (KES)"), C("Status")],
      ],
      ["Rejected items", "table", [C("Ref"), C("Goods receipt"), C("Supplier"), C("Item"), N("Qty"), C("Reason"), C("Status")]],
    ],
    true,
  ),
  mod(
    "vend",
    "Procurement",
    "store",
    "Suppliers",
    "The businesses you buy from",
    "suppliers",
    [["Suppliers", "table", [C("Name"), C("Type"), C("Phone"), C("Email"), C("Town or city"), C("Status")]]],
    true,
  ),
  mod(
    "fin",
    "Financials",
    "calculator",
    "Accounts",
    "Bank accounts, mobile money and cash",
    "accounts",
    [
      ["Bank accounts", "table", [C("Account"), C("Bank or provider"), C("Account number"), C("Type"), N("Balance (KES)")]],
      ["Deposits", "table", [C("Ref"), C("Date"), C("Account"), C("Method"), C("Description"), N("Amount (KES)"), C("Status")]],
      ["Withdrawals", "table", [C("Ref"), C("Date"), C("Account"), C("Method"), C("Purpose"), C("Description"), N("Amount (KES)"), C("Status")]],
      ["Transfers", "table", [C("Ref"), C("Date"), C("From"), C("To"), C("Description"), N("Amount (KES)"), C("Status")]],
      ["Transactions", "table", [C("Date"), C("Account"), C("Reference"), C("Description"), N("Amount (KES)")]],
    ],
    true,
  ),
  mod(
    "exp",
    "Financials",
    "wallet",
    "Expenses",
    "Record what the business spends, set up repeat bills and sort spending into categories",
    "expenses",
    [
      ["Overview", "expboard"],
      ["Expenses", "table", [C("Date"), C("Reference and reason"), C("Branch"), C("Category and payee"), C("Source account"), N("Net amount"), C("Status")]],
      ["Recurring", "table", [C("Ref"), C("Name"), C("Category"), C("Paid from"), N("Amount (KES)"), C("Repeats"), C("Next date"), C("Status")]],
      ["Voided", "table", [C("Ref"), C("Date"), C("Category"), C("Payee"), N("Amount (KES)"), C("Voided on"), C("Voided by"), C("Reason")]],
      ["Expense categories", "table", [C("Category"), C("Parent"), N("Monthly budget (KES)"), N("Spent this month (KES)"), C("Needs approval"), C("Status")]],
    ],
    true,
  ),
  mod(
    "rcv",
    "Financials",
    "banknote",
    "Receivables",
    "Money customers owe you, payments, payment plans and credits",
    "receivables",
    [
      [
        "Receivables",
        "table",
        [C("Ref"), C("Customer"), C("Type"), C("Document"), C("Due date"), C("Priority"), N("Total (KES)"), N("Paid (KES)"), N("Balance (KES)"), C("Status")],
      ],
      ["Payments", "table", [C("Ref"), C("Date"), C("Customer"), C("Receivables"), C("Method"), C("Type"), N("Amount (KES)"), C("Verification")]],
      ["Payment plans", "table", [C("Ref"), C("Customer"), C("Receivable"), N("Total (KES)"), C("Instalments"), N("Each (KES)"), C("Next due"), C("Status")]],
      ["Customer credits", "table", [C("Ref"), C("Customer"), C("Reason"), C("Issued"), N("Amount (KES)"), N("Used (KES)"), N("Left (KES)"), C("Status")]],
      ["Bulk payments", "table", [C("Ref"), C("Date"), C("Customer"), C("Receivables paid"), C("Method"), N("Amount (KES)")]],
      [
        "Receivables statement",
        "table",
        [C("Customer"), N("Open"), N("Not yet due"), N("1–30 days"), N("31–60 days"), N("61–90 days"), N("Over 90 days"), N("Total due (KES)")],
      ],
    ],
    true,
  ),
  mod(
    "pay",
    "Financials",
    "landmark",
    "Payables",
    "Money you owe suppliers, approvals, payments, payment plans and supplier credits",
    "payables",
    [
      [
        "Payables",
        "table",
        [C("Ref"), C("Supplier"), C("Type"), C("Branch"), C("Due date"), C("Priority"), N("Total (KES)"), N("Balance (KES)"), C("Approval"), C("Status")],
      ],
      ["Payments", "table", [C("Ref"), C("Date"), C("Supplier"), C("Payables"), C("Method"), C("Type"), N("Amount (KES)"), C("Verification")]],
      ["Bulk payments", "table", [C("Ref"), C("Date"), C("Supplier"), C("Payables paid"), C("Method"), N("Amount (KES)")]],
      ["Supplier credits", "table", [C("Ref"), C("Supplier"), C("Source"), C("Issued"), N("Amount (KES)"), N("Used (KES)"), N("Left (KES)"), C("Status")]],
      [
        "Supplier ageing",
        "table",
        [C("Supplier"), N("Open"), N("Not yet due"), N("1–30 days"), N("31–60 days"), N("61–90 days"), N("Over 90 days"), N("Total owed (KES)")],
      ],
      ["Payment plans", "table", [C("Ref"), C("Supplier"), C("Payable"), N("Total (KES)"), C("Instalments"), N("Each (KES)"), C("Next due"), C("Status")]],
    ],
    true,
  ),
  mod(
    "rep",
    "Financials",
    "chart-column",
    "Reports",
    "See how the business is doing",
    "reports",
    [
      ["Popular", "cards"],
      ["Sales", "cards"],
      ["Money", "cards"],
      ["Stock", "cards"],
      ["Build a report", "form"],
      ["Sent automatically", "table", [C("Report"), C("Cadence"), C("Recipients"), C("Status")]],
    ],
    true,
  ),
  mod("ppl", "People", "users", "Team", "The people who work for you", "team", [["Team", "table", [C("Name"), C("Role"), C("Branch"), C("Status")]]], true),
  mod(
    "perm",
    "People",
    "sliders-horizontal",
    "Permissions",
    "What each role can see and do",
    "permissions",
    [["Permissions", "table", [C("Role"), N("Users"), C("Modules"), C("Scope")]]],
    true,
  ),
  mod("cal", "Office", "calendar", "Calendar", "What’s coming up for the business", "calendar", [["Calendar", "calendar"]], true),
  mod(
    "comm",
    "Office",
    "mail",
    "Messages",
    "Send SMS, email and WhatsApp",
    "messages",
    [
      ["Send message", "form"],
      ["Saved messages", "table", [C("Template"), C("Channel"), C("Variables"), C("Status")]],
      ["Sent messages", "table", [C("Sent"), C("Channel"), C("Audience"), N("Delivered"), C("Status")]],
      ["Campaigns", "table", [C("Campaign"), C("Segment"), N("Sent"), N("Clicks"), C("Status")]],
      ["Scheduled", "table", [C("Scheduled for"), C("Channel"), C("Template"), C("Status")]],
    ],
    true,
  ),
  mod("docs", "Office", "folder", "File Manager", "Company files, organised by folder", "file-manager", [["All documents", "docs"]], true),
  mod(
    "sup",
    "Office",
    "circle-help",
    "Help",
    "Get answers and ask for help",
    "help",
    [["Help Center", "helpcenter"]],
    true,
  ),
  mod("prof", "Account", "users", "Profile", "Your personal details, photo and password", "profile", [["Profile", "profile"]], true),
  mod(
    "set",
    "Account",
    "settings",
    "Settings",
    "Your business, branches, terminals and staff logins",
    "settings",
    [
      ["Business profile", "bizprofile"],
      ["Branches", "table", [C("Group"), C("Branch"), C("City"), C("Phone"), N("Storage locations"), C("Status")]],
      ["Location groups", "table", [C("Parent group"), C("Group"), N("Branches"), N("Sub-groups")]],
      ["Storage locations", "table", [C("Branch"), C("Storage location"), C("Type"), C("Sales")]],
      ["Terminals", "terminals"],
      ["Staff logins", "table", [C("User"), C("Role"), C("Branch"), C("Status")]],
      ["Taxes", "table", [C("Tax"), N("Rate"), C("Type"), C("Status")]],
      ["Connected apps", "table", [C("Integration"), C("Type"), C("Status")]],
      ["Import and export", "form"],
    ],
    true,
  ),
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
