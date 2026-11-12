"use client";

import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { useDialog } from "@/components/ui/Overlay";
import { closeUzaAi, openUzaAi, setAiTab, useUzaAi, type AiTab } from "@/data";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";
import { FeaturesTab } from "./FeaturesTab";
import { SupportTab } from "./SupportTab";

const TABS: [AiTab, string, IconName][] = [
  ["chat", "Uza AI", "sparkles"],
  ["support", "Support", "message-square"],
  ["features", "Features", "lightbulb"],
];

/** Canvas "Uza AI": the floating launcher and the right-hand help panel (feature 008). */
export function UzaAi() {
  const ai = useUzaAi();
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useDialog(ai.open, closeUzaAi);
  const wasOpen = useRef(false);

  // The launcher is re-rendered on close, so return focus to it once it exists again (FR-003).
  useEffect(() => {
    if (wasOpen.current && !ai.open) launcher.current?.focus();
    wasOpen.current = ai.open;
  }, [ai.open]);

  if (!ai.open) {
    return (
      <button
        ref={launcher}
        type="button"
        onClick={openUzaAi}
        aria-label="Open Uza AI"
        className="uz-ai uz-fab fixed bottom-6 right-6 z-[var(--z-launcher)] grid size-[58px] place-items-center rounded-full border-[3px] border-white bg-[linear-gradient(135deg,var(--green-500),var(--green-800))] text-white shadow-fab"
      >
        <Icon name="sparkles" size={26} />
        <span className="uz-fab-tip" aria-hidden="true">
          Open Uza AI
        </span>
      </button>
    );
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label="Uza AI and help"
      className="uz-ai fixed inset-y-0 right-0 z-[var(--z-ai-panel)] flex w-[min(460px,100vw)] flex-col border-l border-border bg-surface shadow-panel"
    >
      <div className="flex flex-none items-center gap-0.5 border-b border-border px-3">
        <div role="tablist" aria-label="Uza AI sections" className="flex min-w-0 items-center gap-0.5">
          {TABS.map(([key, label, icon]) => {
            const on = ai.tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setAiTab(key)}
                className={`type-label flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 pb-[13px] pt-4 ${on ? "border-green-600 text-text" : "border-transparent text-text-secondary hover:text-text"}`}
              >
                <Icon name={icon} size={16} />
                {label}
              </button>
            );
          })}
        </div>
        <span className="flex-1" />
        <IconButton icon="x" size="sm" label="Close" data-close onClick={closeUzaAi} />
      </div>

      {ai.tab === "chat" && (ai.view === "list" ? <ChatList /> : <ChatView />)}
      {ai.tab === "support" && <SupportTab />}
      {ai.tab === "features" && <FeaturesTab />}
    </div>
  );
}
