"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { hrefFor } from "@/config/modules";
import { canSee } from "@/config/roles";
import { AI_PROMPTS, askUzaAi, closeUzaAi, newAiChat, openTicketFromChat, showAiList, useRole, useUzaAi, useViewingLabel, type AiAction } from "@/data";
import { Composer } from "./Composer";
import { AiBadge, Bubble, FileChip } from "./shared";

/** Canvas `ai.isChat`: one conversation with Uza AI (User Story 1). */
export function ChatView() {
  const ai = useUzaAi();
  const role = useRole();
  const where = useViewingLabel();
  const router = useRouter();
  const body = useRef<HTMLDivElement>(null);
  const chat = ai.chats.find((c) => c.id === ai.chatId) ?? null;
  const msgs = chat?.msgs ?? [];
  const lastBot = [...msgs].reverse().find((m) => !m.me);

  // Keep the newest message in view (design `scroll()`).
  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, ai.typing, ai.chatId]);

  const allowed = (a: AiAction) => a.kind === "ticket" || canSee(role, a.module, a.tab);
  const run = (a: AiAction) => {
    if (a.kind === "ticket") return openTicketFromChat(a.ref);
    if (!allowed(a)) return;
    router.push(hrefFor(a.module, a.tab));
    if (window.matchMedia("(max-width: 899px)").matches) closeUzaAi();
  };

  return (
    <>
      <div className="flex flex-none items-center gap-3 border-b border-border px-4 py-3">
        <IconButton icon="arrow-left" size="sm" label="All chats" onClick={showAiList} />
        <span aria-hidden="true" className="size-[9px] flex-none rounded-full bg-green-500" />
        <h2 className="type-title min-w-0 flex-1 truncate text-text">{chat?.title || "Uza AI"}</h2>
        <IconButton icon="plus" size="sm" label="New chat" onClick={newAiChat} />
      </div>

      <div ref={body} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-5">
        {msgs.length === 0 && (
          <div className="my-auto flex flex-col items-center gap-3 py-6 text-center">
            <AiBadge size={72} />
            <div className="type-card-title mt-2 text-[20px] text-text">Chat with Uza AI</div>
            <div className="type-body max-w-[320px] text-text-secondary">
              Ask about sales, stock, money owed or expenses, or report a problem. Uza AI can help with it all.
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {AI_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={ai.typing}
                  onClick={() => void askUzaAi(p, null, where)}
                  className="type-label rounded-pill border border-border bg-surface px-3.5 py-2 text-text hover:bg-canvas"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.me ? "justify-end" : "justify-start"}`}>
            {!m.me && <AiBadge size={28} />}
            <div className={`flex max-w-[82%] flex-col gap-2 ${m.me ? "items-end" : "items-start"}`}>
              {m.file && <FileChip name={m.file} />}
              <Bubble me={m.me}>{m.text}</Bubble>
              {m.act && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="arrow-up-right"
                  disabled={!allowed(m.act)}
                  title={allowed(m.act) ? undefined : "Not available for your role"}
                  onClick={() => run(m.act!)}
                >
                  {m.act.label}
                </Button>
              )}
            </div>
          </div>
        ))}

        {ai.typing && (
          <div className="flex items-end gap-2" aria-label="Uza AI is typing">
            <AiBadge size={28} />
            <div className="uz-dots bg-canvas px-4 py-3" style={{ borderRadius: "16px 16px 16px 4px" }}>
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
        <div className="sr-only" aria-live="polite">
          {!ai.typing && lastBot && msgs.at(-1) === lastBot ? lastBot.text : ""}
        </div>
      </div>

      <Composer where={where} />
    </>
  );
}
