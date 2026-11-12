/**
 * Uza AI seed and fixed copy, ported verbatim from the canvas (`Uzapoint ERP.dc.html` v1794506539):
 * `aiStore()` (chats, ideas, votes), `aiTicketMsgs()` + the Help module's "Help requests" rows
 * (tickets) and `aiAnswer()` (wording). Feature 008, data-model.md.
 */
import type { AiChat, FeatureIdea, ModuleId, SupportTicket } from "../types";

const U = (text: string) => ({ me: true, text });
const B = (text: string, act?: { label: string; module: ModuleId; tab: string }) => ({
  me: false,
  text,
  ...(act ? { act: { kind: "screen" as const, ...act } } : {}),
});

export const AI_CHATS: AiChat[] = [
  {
    id: "c3",
    title: "Which customers owe me money?",
    date: "2026-11-07",
    awaitingDetails: false,
    msgs: [
      U("Which customers owe me money?"),
      B("2 customers have overdue invoices. Open Receivables to see each one and record payments.", { label: "Open Receivables", module: "rcv", tab: "Receivables" }),
    ],
  },
  {
    id: "c2",
    title: "How do I give a refund?",
    date: "2026-10-29",
    awaitingDetails: false,
    msgs: [
      U("How do I give a refund?"),
      B(
        "Go to Sales › Refunds (credit notes) and choose New credit note. Pick the original sale, choose the items being returned, and say whether they go back into stock.",
        { label: "Open Refunds", module: "sales", tab: "Refunds (credit notes)" },
      ),
    ],
  },
  {
    id: "c1",
    title: "Receipt printer stopped printing",
    date: "2026-10-14",
    awaitingDetails: false,
    msgs: [
      U("Report a problem"),
      B("Sorry about that. Tell me what went wrong, which page you were on and what you expected to happen."),
      U("Receipt printer stopped printing at the Westlands till."),
      B("Thanks. I logged this as TKT-1042 so the support team can look at it. You can follow it under Support."),
    ],
  },
];

const FAITH = "Faith · UzaPro support";

/** Help requests rows + `aiTicketMsgs` (first message = subject + "."; non-Open tickets get Faith's reply at 16:05). */
export const SUPPORT_TICKETS: SupportTicket[] = [
  { ref: "TKT-1042", subject: "POS printer not connecting", priority: "High", status: "Open", msgs: [{ me: true, text: "POS printer not connecting.", when: "14 Oct 2026, 10:12" }] },
  {
    ref: "TKT-1041",
    subject: "Stock count mismatch",
    priority: "Medium",
    status: "In progress",
    msgs: [
      { me: true, text: "Stock count mismatch.", when: "22 Oct 2026, 15:40" },
      { me: false, who: FAITH, text: "Thanks for reporting this. We can see the problem and are working on a fix. We'll update you here.", when: "22 Oct 2026, 16:05" },
    ],
  },
  {
    ref: "TKT-1038",
    subject: "Invoice email not sending",
    priority: "Low",
    status: "Resolved",
    msgs: [
      { me: true, text: "Invoice email not sending.", when: "30 Sep 2026, 09:05" },
      { me: false, who: FAITH, text: "This is fixed now. Let us know here if it happens again.", when: "30 Sep 2026, 16:05" },
    ],
  },
];

export const FEATURE_IDEAS: FeatureIdea[] = [
  { id: "i1", title: "M-Pesa payments match invoices automatically", desc: "Money paid to your Till or Paybill is matched to the right invoice by reference, so you don't mark invoices as paid by hand.", status: "Planned", eta: "2-4 weeks", votes: 214, tags: "payments, mpesa" },
  { id: "i2", title: "Send invoices to KRA eTIMS", desc: "Every invoice and credit note is sent to eTIMS when you save it, and the KRA control number prints on the receipt.", status: "Planned", eta: "1-2 months", votes: 187, tags: "tax, invoices" },
  { id: "i3", title: "Different prices for wholesale customers", desc: "Give a customer group its own price list, so the right price fills in when you make a sale or invoice.", status: "Planned", eta: "2-4 weeks", votes: 96, tags: "sales, pricing" },
  { id: "i4", title: "Supplier price history", desc: "See what you paid each supplier for a product over time, and get a warning when a new purchase order costs more than last time.", status: "In progress", eta: "This month", votes: 72, tags: "purchases" },
  { id: "i5", title: "Transaction costs on expenses", desc: "Record M-Pesa and bank charges with each expense so account balances match your statements.", status: "Done", eta: "Released Oct 2026", votes: 133, tags: "expenses" },
  { id: "i6", title: "Send receipts on WhatsApp", desc: "Send the customer their receipt or invoice on WhatsApp straight from the sale.", status: "Under review", votes: 158, tags: "sales, receipts" },
  { id: "i7", title: "Print barcode labels", desc: "Print shelf and product labels with barcodes and prices for any product or delivery.", status: "Under review", votes: 64, tags: "stock, products" },
  { id: "i8", title: "Customer loyalty points", desc: "Customers earn points on every sale and can spend them as a discount next time.", status: "Under review", votes: 41, tags: "customers, sales" },
];

/** The user's seeded vote (`votes: { i6: true }`). */
export const SEED_VOTES: Record<string, boolean> = { i6: true };

/** Words ignored by "Check for similar ideas" (`aiVals` stop list). */
export const IDEA_STOP_WORDS = [
  "with", "that", "this", "from", "when", "want", "would", "have", "they", "your", "send", "sale",
  "sales", "customer", "customers", "after", "more", "make", "help", "product", "products", "every", "able", "should",
];

export const AI_PROMPTS = ["Overdue invoices", "Low stock", "Spending this month", "Report a problem"];

export const AI_COPY = {
  bugAsk: "Sorry about that. Tell me what went wrong, which page you were on and what you expected to happen. I'll pass it to the support team.",
  bugLogged: (ref: string) => `Thanks for telling me. I logged this as ${ref} and sent it to the support team. They usually reply within 4 hours, and you can follow it under Support.`,
  greeting: (first: string) => `Hi ${first}. What can I help you with? You can ask about sales, stock, money owed, expenses, or report a problem.`,
  refund: "Go to Sales › Refunds (credit notes) and choose New credit note. Pick the original sale, choose the items coming back, and say whether they go back into stock.",
  invoice: "To bill a customer, go to Sales › Invoices and choose New invoice. Pick the customer, add the items and save. You can send it from the invoice once it's saved.",
  sales: "Sales so far: KES 184K today, KES 1.12M this week and KES 4.82M this month.",
  purchase: "To order stock, go to Purchases › Purchase orders and choose New purchase order. When the goods arrive, open the order and choose Receive goods.",
  fallback: 'I can help with money customers owe you, stock running low, sales, expenses, how to do things in UzaPro, or reporting a problem.\n\nTry asking "Which invoices are overdue?" or "What stock is running low?"',
  file: (name: string) => `I got ${name}. I can't read files yet, but you can attach it to a support request or an expense.`,
  noAccess: (area: string) => `You don't have access to ${area}. Ask the business owner.`,
  autoReply: (within: string) => `Thanks, we've got your request. Someone from the team will reply here within ${within}.`,
} as const;

/** Reply time by priority (`aiAddTicket`). */
export const REPLY_WITHIN: Record<"High" | "Medium" | "Low", string> = { High: "1 hour", Medium: "4 hours", Low: "1 day" };

export type AiTopic = "owed" | "stock" | "spending" | "refund" | "invoice" | "sales" | "purchase";

/** Each answer's target screen (research R2; Clarification Q1 role gate). */
export const AI_TARGETS: Record<AiTopic, { module: ModuleId; tab: string; area: string; label: string }> = {
  owed: { module: "rcv", tab: "Receivables", area: "Receivables", label: "Open Receivables" },
  stock: { module: "inv", tab: "Overview", area: "Stock", label: "Open Stock" },
  spending: { module: "exp", tab: "Expenses", area: "Expenses", label: "Open Expenses" },
  refund: { module: "sales", tab: "Refunds (credit notes)", area: "Refunds", label: "Open Refunds" },
  invoice: { module: "sales", tab: "Invoices", area: "Invoices", label: "Open Invoices" },
  sales: { module: "sales", tab: "All sales", area: "Sales", label: "Open Sales" },
  purchase: { module: "buy", tab: "Purchase orders", area: "Purchases", label: "Open Purchases" },
};
