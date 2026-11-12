/**
 * Uza AI pure helpers — ports of the canvas `aiAnswer`, `aiVals` (ages, groups, ideas, matching)
 * and `aiAddTicket` numbering, plus the role gate from Clarification Q1 (research R2, R4, R5, R9).
 */
import { findModuleBySlug, findTab } from "@/config/modules";
import { canSee } from "@/config/roles";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { date, num } from "@/lib/format";
import { UZ_STOCK_FIXED } from "./fixtures/overviews";
import { AI_COPY, AI_TARGETS, IDEA_STOP_WORDS, type AiTopic } from "./fixtures/uzaai";
import type { AiAction, AiChat, Expense, FeatureIdea, IdeaStatus, ReceivableRow, Role, Tone, TicketPriority, TicketStatus } from "./types";

const DAY = 864e5;
const today = Date.parse(DEMO_TODAY);

/** The design's `fmt`: "KES 45,600" (rounded, no decimals). */
export const fmtKes = (n: number) => `KES ${num(Math.round(n))}`;

export interface LowStockRow {
  item: string;
  store: string;
  qty: string;
  reorder: string;
  status: string;
}

/** The stock overview's low-stock list (`UZ_STOCK.low`), as the design's stock answer reads it. */
export function lowStockRows(): LowStockRow[] {
  return UZ_STOCK_FIXED.low.map(([item, store, qty, reorder, pill]) => ({ item, store, qty, reorder, status: pill.label }));
}

export interface AnswerContext {
  role: Role;
  first: string;
  /** This chat is waiting for the details of a reported problem. */
  awaiting: boolean;
  receivables: readonly ReceivableRow[];
  lowStock: readonly LowStockRow[];
  expenses: readonly Expense[];
}

export type AiAnswer =
  | { kind: "reply"; text: string; act?: AiAction }
  /** The next message is a problem report: the caller logs a ticket. */
  | { kind: "logTicket" }
  /** The message reports a problem: the caller marks the chat as waiting. */
  | { kind: "askDetails"; text: string };

const has = (t: string, ...words: string[]) => words.some((w) => t.includes(w));

/** Which answer the message asks for, in the design's keyword order (after problem and greeting). */
function topicOf(t: string): AiTopic | null {
  if (has(t, "overdue", "owe", "owed", "debt", "receivable", "unpaid")) return "owed";
  if (has(t, "stock", "reorder", "run out", "running out", "inventory")) return "stock";
  if (has(t, "expense", "spent", "spend", "spending")) return "spending";
  if (has(t, "refund", "credit note", "return")) return "refund";
  if (has(t, "invoice", "bill a customer")) return "invoice";
  if (has(t, "sale", "sold", "revenue", "today", "week")) return "sales";
  if (has(t, "supplier", "purchase", "order")) return "purchase";
  return null;
}

function screen(topic: AiTopic): AiAction {
  const x = AI_TARGETS[topic];
  return { kind: "screen", label: x.label, module: x.module, tab: x.tab };
}

function topicText(topic: AiTopic, ctx: AnswerContext): string {
  switch (topic) {
    case "owed": {
      const rows = ctx.receivables.filter((r) => !r.voided);
      const all = rows.reduce((a, r) => a + r.balance, 0);
      const late = rows.filter((r) => r.status.label === "Overdue").sort((a, b) => b.balance - a.balance);
      if (!late.length) return `No invoices are overdue. Customers owe you ${fmtKes(all)} in total, none of it late.`;
      const worth = late.reduce((a, r) => a + r.balance, 0);
      const list = late.slice(0, 4).map((r) => `• ${r.party}, ${fmtKes(r.balance)} (due ${date(r.due)})`);
      return `${late.length}${late.length === 1 ? " invoice is" : " invoices are"} overdue, worth ${fmtKes(worth)}:\n${list.join("\n")}\n\nIn total customers owe you ${fmtKes(all)}.`;
    }
    case "stock": {
      const low = ctx.lowStock.filter((r) => r.status !== "Healthy");
      return `${low.length} items need restocking:\n${low.map((r) => `• ${r.item} at ${r.store}: ${r.qty} left (reorder at ${r.reorder})`).join("\n")}`;
    }
    case "spending": {
      const paid = ctx.expenses.filter((e) => e.status === "Paid" && e.date.startsWith(DEMO_TODAY.slice(0, 7)));
      const wait = ctx.expenses.filter((e) => e.status === "Waiting approval");
      const total = paid.reduce((a, e) => a + e.amount, 0);
      return (
        `You have spent ${fmtKes(total)} on ${paid.length} paid expenses this month.` +
        (wait.length ? ` ${wait.length}${wait.length === 1 ? " expense is" : " expenses are"} waiting for approval.` : "")
      );
    }
    case "refund":
      return AI_COPY.refund;
    case "invoice":
      return AI_COPY.invoice;
    case "sales":
      return AI_COPY.sales;
    case "purchase":
      return AI_COPY.purchase;
  }
}

/** The design's `aiAnswer`, limited by role (Clarification Q1). */
export function answer(text: string, ctx: AnswerContext): AiAnswer {
  if (ctx.awaiting) return { kind: "logTicket" };
  const t = text.toLowerCase();
  if (has(t, "bug", "problem", "broken", "not working", "doesn't work", "error", "crash")) return { kind: "askDetails", text: AI_COPY.bugAsk };
  if (/^(hi|hello|hey|habari|good (morning|afternoon|evening))\b/.test(t)) return { kind: "reply", text: AI_COPY.greeting(ctx.first || "there") };
  const topic = topicOf(t);
  if (!topic) return { kind: "reply", text: AI_COPY.fallback };
  const target = AI_TARGETS[topic];
  if (!canSee(ctx.role, target.module, target.tab)) return { kind: "reply", text: AI_COPY.noAccess(target.area) };
  return { kind: "reply", text: topicText(topic, ctx), act: screen(topic) };
}

/** "Today", "3d", "2w", "4mo" relative to the demo date (`aiVals` age). */
export function chatAge(iso: string): string {
  const n = Math.round((today - Date.parse(iso)) / DAY);
  return n <= 0 ? "Today" : n < 7 ? `${n}d` : n < 30 ? `${Math.round(n / 7)}w` : `${Math.round(n / 30)}mo`;
}

const recent = (iso: string) => Date.parse(iso) >= today - 7 * DAY;

export interface ChatGroup {
  label: "Last 7 days" | "Older";
  chats: AiChat[];
}

export function chatGroups(chats: readonly AiChat[], filter: "all" | "week"): ChatGroup[] {
  const list = chats.filter((c) => filter === "all" || recent(c.date));
  const groups: ChatGroup[] = [
    { label: "Last 7 days", chats: list.filter((c) => recent(c.date)) },
    { label: "Older", chats: list.filter((c) => !recent(c.date)) },
  ];
  return groups.filter((g) => g.chats.length > 0);
}

export const ideaVotes = (idea: FeatureIdea, votes: Record<string, boolean>) => idea.votes + (votes[idea.id] ? 1 : 0);

export const ROADMAP_GROUPS: { status: IdeaStatus; icon: string; tone: Tone }[] = [
  { status: "Planned", icon: "clipboard-list", tone: "info" },
  { status: "In progress", icon: "wrench", tone: "warning" },
  { status: "Done", icon: "circle-check", tone: "success" },
];

export function roadmap(ideas: readonly FeatureIdea[]) {
  return ROADMAP_GROUPS.map((g) => ({ ...g, ideas: ideas.filter((i) => i.status === g.status) })).filter((g) => g.ideas.length > 0);
}

export function browseIdeas(ideas: readonly FeatureIdea[], votes: Record<string, boolean>, q: string): FeatureIdea[] {
  const needle = q.trim().toLowerCase();
  return ideas
    .filter((i) => !needle || `${i.title} ${i.desc} ${i.tags}`.toLowerCase().includes(needle))
    .sort((a, b) => ideaVotes(b, votes) - ideaVotes(a, votes));
}

export function myIdeas(ideas: readonly FeatureIdea[], votes: Record<string, boolean>, mine: Record<string, boolean>): FeatureIdea[] {
  return ideas.filter((i) => mine[i.id] || votes[i.id]);
}

/** "Check for similar ideas": up to 3 ideas scoring ≥ 2 (title word = 2, description/tags word = 1). */
export function similarIdeas(ideas: readonly FeatureIdea[], title: string, outcome: string): FeatureIdea[] {
  const words = Array.from(
    new Set(
      `${title} ${outcome}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3 && !IDEA_STOP_WORDS.includes(w)),
    ),
  );
  const score = (i: FeatureIdea) =>
    words.reduce((a, w) => a + (i.title.toLowerCase().includes(w) ? 2 : 0) + (`${i.desc} ${i.tags}`.toLowerCase().includes(w) ? 1 : 0), 0);
  return ideas
    .filter((i) => score(i) >= 2)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
}

export function nextTicketRef(tickets: readonly { ref: string }[]): string {
  const n = Math.max(1042, ...tickets.map((t) => Number(t.ref.replace(/\D/g, "")) || 0)) + 1;
  return `TKT-${n}`;
}

export const ticketTone = (s: TicketStatus): Tone => (s === "Resolved" || s === "Closed" ? "success" : "info");
export const priorityTone = (p: TicketPriority): Tone => (p === "High" ? "danger" : p === "Medium" ? "warning" : "neutral");
export const ticketIsOpen = (s: TicketStatus) => !/resolved|closed/i.test(s);
export const ideaTone = (s: IdeaStatus): Tone => (s === "Planned" ? "info" : s === "In progress" ? "warning" : s === "Done" ? "success" : "neutral");

/** The ticket subject for a chat-reported problem. */
export const clipSubject = (text: string) => (text.length > 60 ? `${text.slice(0, 57)}…` : text);

/** The "Viewing:" chip text (research R9). */
export function viewingLabel(pathname: string): string {
  const [slug = "", tabSlug = ""] = pathname.split("/").filter(Boolean);
  if (!slug || slug === "dashboard") return "Dashboard";
  const m = findModuleBySlug(slug);
  if (!m) return "Dashboard";
  const tab = (tabSlug && findTab(m, tabSlug)) || m.tabs[0];
  return m.tabs.length > 1 && tab && tab.title !== m.name && tab.title !== "Overview" ? `${m.name} › ${tab.title}` : m.name;
}
