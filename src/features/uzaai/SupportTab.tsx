"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  openTicket,
  sendSupportRequest,
  sendTicketReply,
  setSupportForm,
  setTicketReply,
  supportBack,
  supportNew,
  ticketIsOpen,
  ticketTone,
  useUzaAi,
  type TicketPriority,
} from "@/data";
import { Bubble, IconTile, PanelHead } from "./shared";

/** Canvas `ai.isSupport`: the list, the new-request form and one ticket (User Story 3). */
export function SupportTab() {
  const { support } = useUzaAi();
  if (support.view === "new") return <SupportForm />;
  if (support.view === "ticket") return <TicketView />;
  return <SupportList />;
}

function SupportList() {
  const { tickets } = useUzaAi();
  return (
    <>
      <PanelHead
        lead={<IconTile icon="message-square" />}
        title="Support"
        sub="Your support requests and our replies."
        action={
          <Button icon="plus" onClick={supportNew}>
            New request
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-5 py-4">
        {tickets.map((t) => {
          const last = t.msgs[t.msgs.length - 1]!;
          return (
            <button
              key={t.ref}
              type="button"
              onClick={() => openTicket(t.ref)}
              className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-green-200 hover:bg-canvas"
            >
              <span className="flex w-full items-center gap-2">
                <span className="type-small u-num text-text-muted">{t.ref}</span>
                <span className="flex-1" />
                <StatusPill tone={ticketTone(t.status)}>{t.status}</StatusPill>
              </span>
              <span className="type-label text-text">{t.subject}</span>
              <span className="type-small w-full truncate text-text-secondary">
                {last.me ? "You: " : ""}
                {last.text}
              </span>
              <span className="type-small text-text-muted">
                {t.priority} priority · {last.when}
              </span>
            </button>
          );
        })}
        {tickets.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-lg border-[1.5px] border-dashed border-border-strong bg-canvas px-5 py-6 text-center">
            <div className="type-body text-text-secondary">No support requests yet.</div>
            <Button icon="plus" onClick={supportNew}>
              Start a conversation
            </Button>
            <div className="type-small text-text-secondary">
              Use <strong className="text-text">Report a problem</strong> in Uza AI for things that are broken. For ideas, use the{" "}
              <strong className="text-text">Features</strong> tab.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SupportForm() {
  const { support } = useUzaAi();
  const f = support.form;
  return (
    <>
      <div className="flex flex-none items-center gap-3 border-b border-border px-4 py-3">
        <IconButton icon="arrow-left" size="sm" label="Back" onClick={supportBack} />
        <h2 className="type-title text-text">New support request</h2>
      </div>
      <form
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          sendSupportRequest();
        }}
      >
        <Input label="Subject" placeholder="For example, Receipt printer not working" value={f.subject} onChange={(e) => setSupportForm({ subject: e.target.value })} />
        <SearchSelect label="How urgent is it?" options={["Low", "Medium", "High"]} value={f.priority} onChange={(v) => setSupportForm({ priority: v as TicketPriority })} />
        <Textarea
          label="What happened?"
          rows={6}
          placeholder="Tell us what you were doing, what went wrong and what you expected."
          value={f.body}
          onChange={(e) => setSupportForm({ body: e.target.value })}
        />
        {support.error && (
          <div role="alert" className="type-small text-danger-text">
            {support.error}
          </div>
        )}
        <Button type="submit" icon="send" fullWidth>
          Send to support
        </Button>
        <div className="type-small text-text-muted">We reply to high-priority requests within 1 hour, medium within 4 hours and low within 1 day.</div>
      </form>
    </>
  );
}

function TicketView() {
  const { support, tickets } = useUzaAi();
  const t = tickets.find((x) => x.ref === support.ref);
  if (!t) return <SupportList />;
  return (
    <>
      <div className="flex flex-none items-center gap-3 border-b border-border px-4 py-3">
        <IconButton icon="arrow-left" size="sm" label="Back" onClick={supportBack} />
        <div className="min-w-0 flex-1">
          <h2 className="type-title truncate text-text">{t.subject}</h2>
          <div className="type-small text-text-muted">
            {t.ref} · {t.priority} priority
          </div>
        </div>
        <StatusPill tone={ticketTone(t.status)}>{t.status}</StatusPill>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5" aria-label={`${t.ref} messages`}>
        {t.msgs.map((m, i) => (
          <div key={i} className={`flex flex-col gap-1 ${m.me ? "items-end" : "items-start"}`}>
            <span className="type-small text-text-muted">
              {m.me ? "You" : m.who} · {m.when}
            </span>
            <div className="max-w-[85%]">
              <Bubble me={m.me} radius={14}>
                {m.text}
              </Bubble>
            </div>
          </div>
        ))}
      </div>
      {ticketIsOpen(t.status) && (
        <form
          className="flex flex-none items-end gap-2 border-t border-border px-4 pb-4 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendTicketReply();
          }}
        >
          <textarea
            rows={2}
            placeholder="Write a reply"
            aria-label="Reply"
            value={support.reply}
            onChange={(e) => setTicketReply(e.target.value)}
            className="type-body min-w-0 flex-1 resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-text outline-none focus:border-action focus:shadow-[0_0_0_3px_var(--green-100)]"
          />
          <Button type="submit" icon="send">
            Send
          </Button>
        </form>
      )}
    </>
  );
}

