"use client";

import { Icon } from "@/components/ui/Icon";
import { askUzaAi, setAiDraft, setAiFile, useUzaAi } from "@/data";
import { FileChip } from "./shared";

/** Canvas chat composer: "Viewing:" chip, file chip, 4,000-character box, attach and send. */
export function Composer({ where }: { where: string }) {
  const ai = useUzaAi();
  const canSend = (!!ai.draft.trim() || !!ai.file) && !ai.typing;
  const send = () => {
    if (canSend) void askUzaAi(ai.draft, ai.file, where);
  };

  return (
    <div className="flex flex-none flex-col gap-2 border-t border-border px-4 pb-4 pt-3">
      <span className="type-small inline-flex max-w-full items-center gap-1.5 self-start rounded-pill border border-border bg-canvas px-2.5 py-1 text-text-secondary">
        <span aria-hidden="true" className="size-[7px] flex-none rounded-full bg-green-600" />
        <span className="min-w-0 truncate">Viewing: {where}</span>
      </span>
      <div className="flex flex-col gap-2 rounded-lg border-[1.5px] border-green-200 bg-surface p-3 focus-within:border-green-600">
        {ai.file && <FileChip name={ai.file} onRemove={() => setAiFile(null)} />}
        <textarea
          rows={2}
          maxLength={4000}
          placeholder="Ask Uza AI anything…"
          aria-label="Message to Uza AI"
          value={ai.draft}
          onChange={(e) => setAiDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="type-body w-full resize-none border-0 bg-transparent p-0 text-text outline-none"
        />
        <div className="flex items-center gap-2">
          <label title="Attach a file" className="grid size-8 cursor-pointer place-items-center rounded-md text-text-secondary hover:bg-canvas focus-within:shadow-[0_0_0_2px_var(--green-600)]">
            <Icon name="paperclip" size={18} />
            <input
              type="file"
              aria-label="Attach a file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAiFile(f.name);
                e.target.value = "";
              }}
            />
          </label>
          <span className="type-small flex-1 text-text-muted">{ai.draft.length.toLocaleString("en-KE")} / 4,000</span>
          <button
            type="button"
            onClick={send}
            aria-label="Send"
            disabled={!canSend}
            className={`grid size-[38px] place-items-center rounded-full text-white ${canSend ? "bg-green-700 hover:bg-green-800" : "bg-green-200"}`}
          >
            <Icon name="send" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
