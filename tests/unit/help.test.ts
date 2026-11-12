import { beforeEach, describe, expect, it } from "vitest";
import { CHAT_REPLY, sendChatMessage } from "@/data/commands/help";
import { createAppStore, registerStore, type AppStore } from "@/data/store";

let store: AppStore;
beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("Ask UzaPro chat", () => {
  it("starts with the design's three messages", () => {
    const m = store.getState().help.messages;
    expect(m.map((x) => x.me)).toEqual([false, true, false]);
    expect(m[1]!.text).toBe("How do I issue a credit note?");
  });

  it("adds the trimmed message, then the fixed reply", async () => {
    const r = await sendChatMessage("  Where is my stock?  ");
    expect(r.ok).toBe(true);
    const m = store.getState().help.messages;
    expect(m.slice(-2)).toEqual([
      { me: true, text: "Where is my stock?" },
      { me: false, text: CHAT_REPLY },
    ]);
  });

  it("ignores a blank message", async () => {
    const r = await sendChatMessage("   ");
    expect(r.ok).toBe(false);
    expect(store.getState().help.messages).toHaveLength(3);
  });
});
