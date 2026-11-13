/**
 * Uza AI commands — the canvas `aiVals` handlers and `aiAddTicket` (feature 008, contracts/ui-and-data.md).
 * All state lives in the in-memory `ai` slice and resets on reload (Principle III).
 */
import { effectiveRole } from "../permissions";
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date } from "@/lib/format";
import { AI_COPY, REPLY_WITHIN } from "../fixtures/uzaai";
import { receivableRows } from "../money";
import { currentUserFirst } from "../profile";
import { getStore, showToast } from "../store";
import type { AiState, AiTab, FeaturesTabName } from "../store/state";
import { fail, ok, type AiAction, type AiChat, type Result, type TicketPriority } from "../types";
import { answer, clipSubject, lowStockRows, nextTicketRef } from "../uzaai";

/** The design's reply delay (ms). */
export const AI_REPLY_DELAY = 700;

const setAi = (fn: (ai: AiState) => Partial<AiState>) => getStore().setState((s) => ({ ai: { ...s.ai, ...fn(s.ai) } }));
const stamp = () => `${date(DEMO_TODAY)}, ${demoTime()}`;

// ── Panel ──────────────────────────────────────────────────────────────────

/** The launcher always starts a new, empty chat (design `ai.open`). */
export function openUzaAi(): void {
  setAi(() => ({ open: true, tab: "chat", view: "chat", chatId: null, draft: "", file: null }));
}

export function closeUzaAi(): void {
  setAi(() => ({ open: false }));
}

export function setAiTab(tab: AiTab): void {
  setAi(() => ({ tab }));
}

// ── Chat ───────────────────────────────────────────────────────────────────

export function newAiChat(): void {
  setAi(() => ({ tab: "chat", view: "chat", chatId: null, draft: "", file: null }));
}

export function showAiList(): void {
  setAi(() => ({ view: "list" }));
}

export function openAiChat(id: string): void {
  setAi(() => ({ tab: "chat", view: "chat", chatId: id }));
}

export function setAiFilter(filter: "all" | "week"): void {
  setAi(() => ({ filter }));
}

export function setAiDraft(text: string): void {
  setAi(() => ({ draft: text.slice(0, 4000) }));
}

export function setAiFile(name: string | null): void {
  setAi(() => ({ file: name }));
}

const updateChat = (ai: AiState, id: string, fn: (c: AiChat) => AiChat) => ai.chats.map((c) => (c.id === id ? fn(c) : c));

/** Send a message; Uza AI replies after the design's 0.7s pause (research R3). */
export function askUzaAi(raw: string, file: string | null, where: string): Promise<void> {
  const store = getStore();
  const text = raw.trim();
  const ai0 = store.getState().ai;
  if ((!text && !file) || ai0.typing) return Promise.resolve();

  let id = ai0.chatId && ai0.chats.some((c) => c.id === ai0.chatId) ? ai0.chatId : null;
  setAi((ai) => {
    const msg = { me: true, text: text || "Sent a file", ...(file ? { file } : {}) };
    if (!id) {
      id = `n${ai.seq}`;
      const chat: AiChat = { id, title: text || file || "", date: DEMO_TODAY, msgs: [msg], awaitingDetails: false };
      return { seq: ai.seq + 1, chats: [chat, ...ai.chats], chatId: id, view: "chat", draft: "", file: null, typing: true };
    }
    return { chats: updateChat(ai, id, (c) => ({ ...c, date: DEMO_TODAY, msgs: [...c.msgs, msg] })), view: "chat", draft: "", file: null, typing: true };
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      const s = store.getState();
      const chatId = id!;
      const chat = s.ai.chats.find((c) => c.id === chatId);
      let reply: { text: string; act?: AiAction };
      let awaitingDetails = false;
      if (file && !text) reply = { text: AI_COPY.file(file) };
      else {
        const a = answer(text, {
          role: effectiveRole(s, s.session.role),
          first: currentUserFirst(s),
          awaiting: !!chat?.awaitingDetails,
          receivables: receivableRows(s.money.receivables),
          lowStock: lowStockRows(),
          expenses: s.expenses.expenses,
        });
        if (a.kind === "logTicket") {
          const ref = addTicket(clipSubject(text), "Medium", `${text}\n\n(Reported from ${where})`);
          reply = { text: AI_COPY.bugLogged(ref), act: { kind: "ticket", label: `Open ${ref}`, ref } };
        } else if (a.kind === "askDetails") {
          reply = { text: a.text };
          awaitingDetails = true;
        } else reply = { text: a.text, ...(a.act ? { act: a.act } : {}) };
      }
      setAi((ai) => ({
        typing: false,
        chats: updateChat(ai, chatId, (c) => ({ ...c, awaitingDetails, msgs: [...c.msgs, { me: false, ...reply }] })),
      }));
      resolve();
    }, AI_REPLY_DELAY);
  });
}

/** A ticket action opens Support on that ticket; a screen action is navigated by the caller. */
export function openTicketFromChat(ref: string): void {
  setAi((ai) => ({ tab: "support", support: { ...ai.support, view: "ticket", ref, reply: "" } }));
}

// ── Support ────────────────────────────────────────────────────────────────

/** `aiAddTicket`: next number, Open, the user's message and the automatic reply for its priority. */
export function addTicket(subject: string, priority: TicketPriority, body: string): string {
  const ref = nextTicketRef(getStore().getState().ai.tickets);
  setAi((ai) => ({
    tickets: [
      {
        ref,
        subject,
        priority,
        status: "Open",
        msgs: [
          { me: true, text: body || subject, when: stamp() },
          { me: false, who: "UzaPro support", text: AI_COPY.autoReply(REPLY_WITHIN[priority]), when: "Automatic reply" },
        ],
      },
      ...ai.tickets,
    ],
  }));
  return ref;
}

export function supportNew(): void {
  setAi((ai) => ({ support: { ...ai.support, view: "new", form: { subject: "", priority: "Medium", body: "" }, error: "" } }));
}

export function supportBack(): void {
  setAi((ai) => ({ support: { ...ai.support, view: "list" } }));
}

export function openTicket(ref: string): void {
  setAi((ai) => ({ support: { ...ai.support, view: "ticket", ref, reply: "" } }));
}

export function setSupportForm(patch: Partial<AiState["support"]["form"]>): void {
  setAi((ai) => ({ support: { ...ai.support, form: { ...ai.support.form, ...patch }, error: "" } }));
}

export function sendSupportRequest(): Result<string> {
  const { form } = getStore().getState().ai.support;
  const error = !form.subject.trim() ? "Add a subject so we know what this is about." : !form.body.trim() ? "Tell us what happened." : "";
  if (error) {
    setAi((ai) => ({ support: { ...ai.support, error } }));
    return fail(error);
  }
  const ref = addTicket(form.subject.trim(), form.priority, form.body.trim());
  setAi(() => ({ support: { view: "ticket", ref, form: { subject: "", priority: "Medium", body: "" }, error: "", reply: "" } }));
  const message = `${ref} sent to support.`;
  showToast(message);
  return ok(ref, message);
}

export function setTicketReply(text: string): void {
  setAi((ai) => ({ support: { ...ai.support, reply: text } }));
}

export function sendTicketReply(): void {
  const { support } = getStore().getState().ai;
  const text = support.reply.trim();
  if (!text || !support.ref) return;
  setAi((ai) => ({
    tickets: ai.tickets.map((t) => (t.ref === support.ref ? { ...t, msgs: [...t.msgs, { me: true, text, when: stamp() }] } : t)),
    support: { ...ai.support, reply: "" },
  }));
}

// ── Features ───────────────────────────────────────────────────────────────

export function setFeaturesTab(tab: FeaturesTabName): void {
  setAi((ai) => ({ features: { ...ai.features, tab } }));
}

export function setIdeaQuery(q: string): void {
  setAi((ai) => ({ features: { ...ai.features, q } }));
}

export function toggleIdeaVote(id: string): void {
  setAi((ai) => ({ votes: { ...ai.votes, [id]: !ai.votes[id] } }));
}

/** Editing any field hides the similar-ideas check again. */
export function setIdeaForm(patch: Partial<AiState["features"]["form"]>): void {
  setAi((ai) => ({ features: { ...ai.features, form: { ...ai.features.form, ...patch }, checked: false, error: "" } }));
}

export function checkIdea(): Result<void> {
  const { form } = getStore().getState().ai.features;
  const error = !form.title.trim() ? "Give your idea a title." : !form.outcome.trim() ? "Say what the idea would help you do." : "";
  setAi((ai) => ({ features: { ...ai.features, error, checked: !error } }));
  return error ? fail(error) : ok(undefined);
}

export function submitIdea(): Result<string> {
  const { features, seq } = getStore().getState().ai;
  if (!features.checked) return fail("Check for similar ideas first.");
  const id = `u${seq}`;
  setAi((ai) => ({
    seq: ai.seq + 1,
    ideas: [...ai.ideas, { id, title: features.form.title.trim(), desc: features.form.outcome.trim(), status: "Under review", votes: 0, tags: features.form.tags.trim() }],
    mine: { ...ai.mine, [id]: true },
    votes: { ...ai.votes, [id]: true },
    features: { ...ai.features, tab: "My ideas", form: { title: "", outcome: "", tags: "" }, checked: false, error: "" },
  }));
  const message = "Thanks. Your idea was shared.";
  showToast(message);
  return ok(id, message);
}
