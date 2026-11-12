"use client";

import { Button } from "@/components/ui/Button";
import { chatAge, chatGroups, newAiChat, openAiChat, setAiFilter, useUzaAi } from "@/data";
import { AiBadge, IconTile, PanelHead } from "./shared";

const FILTERS: ["all" | "week", string][] = [
  ["all", "All"],
  ["week", "Last 7 days"],
];

/** Canvas `ai.isList`: past chats grouped "Last 7 days" / "Older" (User Story 2). */
export function ChatList() {
  const ai = useUzaAi();
  const groups = chatGroups(ai.chats, ai.filter);
  return (
    <>
      <PanelHead
        lead={<AiBadge size={44} />}
        title="Uza AI"
        sub="Your business helper in UzaPro"
        action={
          <Button icon="plus" onClick={newAiChat}>
            New
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-5 py-4">
        <div className="mb-2 flex gap-2">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={ai.filter === key}
              onClick={() => setAiFilter(key)}
              className={`type-label rounded-pill px-3.5 py-1.5 ${ai.filter === key ? "bg-green-700 text-white" : "bg-canvas text-text-secondary hover:text-text"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {groups.map((g) => (
          <section key={g.label} aria-label={g.label} className="flex flex-col gap-2">
            <h3 className="type-eyebrow mt-3 text-text-muted">{g.label}</h3>
            {g.chats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openAiChat(c.id)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-canvas"
              >
                <IconTile icon="message-square" size={36} glyph={16} />
                <span className="type-label min-w-0 flex-1 truncate text-text">{c.title}</span>
                <span className="type-small flex-none text-text-muted">{chatAge(c.date)}</span>
              </button>
            ))}
          </section>
        ))}
        {groups.length === 0 && <div className="type-body py-6 text-center text-text-muted">No chats in this period.</div>}
      </div>
    </>
  );
}
