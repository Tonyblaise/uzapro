/** Verbatim port of the design's `ALERTS` and `UZ_ROLES` (design/canvas/erp-data.js). */
import type { Alert, Module, ModuleId, QuickTask, Role, RoleId, Tab, Tone } from "@/data/types";
import { MODULES } from "./modules";

const tone = (t: string): Tone => (t === "bad" ? "danger" : t === "warn" ? "warning" : t === "good" ? "success" : "info");
const A = (title: string, subtitle: string, t: string, module: ModuleId, tab: string): Alert => ({ title, subtitle, tone: tone(t), module, tab });
const T = (title: string, subtitle: string, icon: string, module: ModuleId, tab: string, action?: QuickTask["action"]): QuickTask => ({
  title,
  subtitle,
  icon,
  module,
  tab,
  ...(action ? { action } : {}),
});

export const ALERTS = {
  owed: A("9 customers are late paying", "KES 3.2M to collect", "bad", "fin", "Deposits"),
  low: A("14 items are running low", "Order more before they run out", "warn", "inv", "Stock management"),
  vat: A("VAT of KES 164K is due on 20 Nov", "October return", "warn", "fin", "Withdrawals"),
  bank: A("18 bank payments to check", "Match them to your records", "warn", "fin", "Transactions"),
  bill: A("Road & Travel Tyres bill is late", "KES 1,918, was due 31 Oct", "bad", "fin", "Withdrawals"),
  part: A("1 delivery is only partly received", "PUR-ORD-0408, Magaliesburg Wheels", "warn", "buy", "Goods receipts"),
  quote: A("8 quotations are waiting on customers", "KES 420K", "warn", "sales", "Quotations"),
} satisfies Record<string, Alert>;

export const ROLES: Record<RoleId, Role> = {
  owner: {
    id: "owner",
    label: "Owner",
    name: "Tony Ashiuma",
    role: "Owner",
    first: "Tony",
    tasks: [
      T("New sale", "Record a sale", "shopping-cart", "sales", "All sales", "new"),
      T("Send an invoice", "Bill a customer", "receipt", "sales", "Invoices", "invoice"),
      T("Stock in", "Record a delivery", "boxes", "inv", "Stock management", "stock"),
      T("Pay a supplier", "See bills to pay", "banknote", "fin", "Withdrawals"),
    ],
    attention: [ALERTS.owed, ALERTS.low, ALERTS.vat, ALERTS.bank],
  },
  accountant: {
    id: "accountant",
    label: "Accountant",
    name: "Mary Achieng",
    role: "Accountant",
    first: "Mary",
    figures: true,
    mods: ["home", "cal", "sales", "cust", "vend", "buy", "fin", "exp", "rcv", "pay", "rep", "ppl", "docs", "sup"],
    tabs: {
      home: ["Overview"],
      sales: ["Overview", "All sales", "Invoices", "Refunds (credit notes)", "Voided items", "Sales targets"],
      buy: ["Overview", "Purchase orders", "Purchase returns", "Rejected items"],
    },
    tasks: [
      T("Send an invoice", "Bill a customer", "receipt", "sales", "Invoices", "invoice"),
      T("Pay a supplier", "See bills to pay", "banknote", "fin", "Withdrawals"),
      T("Check the bank", "Match payments", "calculator", "fin", "Transactions"),
      T("Prepare VAT", "October return", "file-text", "fin", "Withdrawals"),
    ],
    attention: [ALERTS.bank, ALERTS.vat, ALERTS.owed, ALERTS.bill],
  },
  cashier: {
    id: "cashier",
    label: "Cashier",
    name: "Jane Smith",
    role: "Cashier",
    first: "Jane",
    mods: ["home", "cal", "sales", "cust", "inv", "sup"],
    tabs: {
      home: ["Overview"],
      cust: ["Customers"],
      sales: ["All sales", "Refunds (credit notes)"],
      inv: ["Stock management"],
      sup: ["Help Center"], // feature 007: replaces the design's Ask UzaPro and How-to guides (spec › Design deviations)
    },
    tasks: [
      T("New sale", "Record a sale", "shopping-cart", "sales", "All sales", "new"),
      T("Give a refund", "Return an item", "refresh-cw", "sales", "Refunds (credit notes)", "credit"),
      T("Find a customer", "Look up details", "user", "cust", "Customers"),
      T("Check stock", "See what’s left", "boxes", "inv", "Stock management"),
    ],
    attention: [ALERTS.low],
  },
  store: {
    id: "store",
    label: "Store keeper",
    name: "Grant Jensen",
    role: "Store keeper",
    first: "Grant",
    mods: ["home", "cal", "vend", "inv", "prod", "buy", "docs", "sup"],
    tabs: {
      home: ["Overview"],
      buy: ["Purchase orders", "Goods receipts", "Purchase returns", "Rejected items"],
      sup: ["Help Center"], // feature 007: replaces the design's Ask UzaPro and How-to guides (spec › Design deviations)
    },
    tasks: [
      T("Stock in", "Record a delivery", "truck", "inv", "Stock management", "stock"),
      T("Transfer stock", "Between stores", "boxes", "inv", "Transfer stock", "transfer"),
      T("Record wastage", "Damaged, expired or lost", "circle-alert", "inv", "Wastage", "waste"),
    ],
    attention: [ALERTS.low, ALERTS.part],
  },
};

export const ROLE_IDS: RoleId[] = ["owner", "accountant", "cashier", "store"];

export function isRoleId(v: unknown): v is RoleId {
  return typeof v === "string" && (ROLE_IDS as string[]).includes(v);
}

/** Modules the role can see, in registry order. `mods` absent = all modules. */
export function visibleModules(role: Role): Module[] {
  return MODULES.filter((m) => !role.mods || role.mods.includes(m.id));
}

/** Tabs the role can see in a module. Empty if the module itself is hidden. */
export function visibleTabs(role: Role, moduleId: ModuleId): Tab[] {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m || (role.mods && !role.mods.includes(moduleId))) return [];
  const allowed = role.tabs?.[moduleId];
  return allowed ? m.tabs.filter((t) => allowed.includes(t.title)) : m.tabs;
}

export function canSee(role: Role, moduleId: ModuleId, tabTitle?: string): boolean {
  const tabs = visibleTabs(role, moduleId);
  if (tabs.length === 0) return false;
  return tabTitle ? tabs.some((t) => t.title === tabTitle) : true;
}

