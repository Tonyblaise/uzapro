"use client";
/**
 * Help › Ask UzaPro (feature 006, US1). Port of the canvas `isChat` block: header card, the
 * conversation (user right on the action colour, assistant left on the surface colour) and the
 * composer. Every message gets the design's fixed reply (`sendChatMessage`).
 */
import { useState, type FormEvent } from "react";
import { sendChatMessage, useChatMessages } from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { NewRecordDrawer } from "@/features/generic/NewRecordDrawer";

export function AskUzaPro() {
  const messages = useChatMessages();
  const [draft, setDraft] = useState("");

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    void sendChatMessage(draft);
    setDraft("");
  };

  return (
    <div className="flex max-w-[640px] flex-col gap-3">
      <Card>
        <div className="flex items-center gap-3">
          <span className="grid size-10 flex-none place-items-center rounded-md bg-green-50 text-green-600">
            <Icon name="circle-help" size={18} />
          </span>
          <div>
            <div className="type-title text-text">UzaPro assistant</div>
            <div className="type-small text-text-muted">Ask about stock, an invoice, or how to do something.</div>
          </div>
        </div>
      </Card>
      <div role="log" aria-live="polite" aria-label="Conversation" className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`type-body max-w-[80%] rounded-lg px-4 py-3 ${m.me ? "self-end bg-action text-text-on-action" : "self-start bg-surface text-text"}`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Input placeholder="Type a message" aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </div>
        <Button type="submit">Send</Button>
      </form>
      <NewRecordDrawer moduleId="sup" />
    </div>
  );
}
