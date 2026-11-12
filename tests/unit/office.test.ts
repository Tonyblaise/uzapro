import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CAL_TODAY, calStamp, comingUp, monthGrid, shiftMonth, visibleEvents } from "@/data/calendar";
import { deleteDocText, docSize, fileKind, folderPath, keepExtension, storageTotals, subtree } from "@/data/docs";
import { currentUserFirst, currentUserName } from "@/data/profile";
import { activeTerminals, bizCompletion, groupAncestors, groupParentOptions, nextCode } from "@/data/settings";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { createSeed } from "@/data/store/seed";
import { addBranchQuick, deleteStorageLocation, saveBranch, saveGroup, saveStorageLocation, saveTerminal, setTerminalActive } from "@/data/commands/settings";
import { deleteStore, saveStore } from "@/data/commands/stock";
import { createFolder, deleteDoc, renameDoc, uploadFile } from "@/data/commands/docs";
import { deleteEvent, saveEvent } from "@/data/commands/calendar";
import { changePassword, saveProfile, setPhoto } from "@/data/commands/profile";
import { canDeleteGeneric, deleteGenericRow } from "@/data/commands/generic";

describe("calendar helpers", () => {
  it("lays November 2026 out Monday-first from Mon 26 Oct", () => {
    const g = monthGrid(2026, 11);
    expect(g[0]).toMatchObject({ iso: "2026-10-26", day: 26, inMonth: false });
    expect(g).toHaveLength(42);
    expect(g.length % 7).toBe(0);
    expect(g.find((c) => c.isToday)?.iso).toBe(CAL_TODAY);
    expect(g.filter((c) => c.inMonth)).toHaveLength(30);
    expect(g.at(-1)!.iso).toBe("2026-12-06");
  });

  it("shifts months across the year", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("lists the next 5 events from 1 Nov 2026", () => {
    const up = comingUp(createSeed().calendar.events);
    expect(up.map((e) => e.title)).toEqual([
      "Statement reminder email",
      "Stock count at Point of Sale",
      "Team meeting",
      "Purchase machinery due",
      "VAT return due",
    ]);
  });

  it("hides Accounts events from the cashier and the store keeper only", () => {
    const events = createSeed().calendar.events;
    const accounts = events.filter((e) => e.type === "Accounts").length;
    expect(visibleEvents(events, "cashier").some((e) => e.type === "Accounts")).toBe(false);
    expect(visibleEvents(events, "store").some((e) => e.type === "Accounts")).toBe(false);
    expect(visibleEvents(events, "owner")).toHaveLength(events.length);
    expect(visibleEvents(events, "accountant").filter((e) => e.type === "Accounts")).toHaveLength(accounts);
  });

  it("formats the details stamp", () => {
    expect(calStamp("2026-11-01", "09:00")).toBe("1 November 2026 at 9:00 AM");
    expect(calStamp("2026-11-12", "14:00")).toBe("12 November 2026 at 2:00 PM");
    expect(calStamp("2026-11-20")).toBe("20 November 2026");
  });
});

describe("docs helpers", () => {
  const { folders, files } = createSeed().docs;

  it("collects the legal subtree", () => {
    expect(subtree(folders, "legal").sort()).toEqual(["contracts", "insurances", "legal", "loans", "registrations"]);
    expect(deleteDocText(folders, files, "folder", "legal")).toBe("This permanently deletes the folder and everything in it: 4 subfolders and 7 files.");
    expect(deleteDocText(folders, files, "folder", "admin")).toBe("This permanently deletes the folder. It is empty.");
  });

  it("keeps the extension on rename", () => {
    expect(keepExtension("x.pdf", "y")).toBe("y.pdf");
    expect(keepExtension("Archive", " Notes ")).toBe("Notes");
    expect(keepExtension("a.b.xlsx", "c")).toBe("c.xlsx");
  });

  it("classifies files and totals storage", () => {
    expect(fileKind("Scanned receipt.jpg")).toBe("Image");
    expect(fileKind("Price list Q4.xlsx")).toBe("Spreadsheet");
    expect(fileKind("INV-0351.pdf")).toBe("PDF");
    expect(fileKind("brief.docx")).toBe("Document");
    const t = storageTotals(files);
    expect(t.images).toBe(1840);
    expect(t.spreadsheets).toBe(64 + 88 + 72);
    expect(t.total).toBe(t.images + t.documents + t.spreadsheets);
    expect(docSize(412)).toBe("412 KB");
    expect(docSize(1840)).toBe("1.8 MB");
  });

  it("builds the breadcrumb path", () => {
    expect(folderPath(folders, "y2026").map((f) => f.name)).toEqual(["Finance", "Annual Closing", "2026"]);
    expect(folderPath(folders, null)).toEqual([]);
  });
});

describe("settings helpers", () => {
  it("finds the 2 missing required details in the seed", () => {
    const c = bizCompletion(createSeed().settings.biz);
    expect(c.missing.map((m) => m.label)).toEqual(["Trading name", "KRA PIN"]);
    expect(c.title).toBe("2 required details missing");
    expect(c.pct).toBe(80);
    expect(c.more).toBe("");
  });

  it("numbers codes from the highest existing one", () => {
    const s = createSeed().settings;
    expect(nextCode("BRN", s.branches)).toBe("BBL-BRN-003");
    expect(nextCode("GRP", s.groups)).toBe("BBL-GRP-002");
    expect(nextCode("TRM", [])).toBe("BBL-TRM-001");
    expect(nextCode("TRM", [{ code: "BBL-TRM-001" }, { code: "BBL-TRM-007" }])).toBe("BBL-TRM-008");
  });

  it("counts active terminals (no slots: terminals are free)", () => {
    const t = createSeed().settings.terminals;
    expect(activeTerminals(t)).toBe(1);
    expect(activeTerminals({ list: [...t.list, { ...t.list[0]!, id: 2, main: false, active: false }] })).toBe(1);
  });

  it("walks group ancestors and excludes cycles from parent options", () => {
    const groups = [
      { name: "A", parent: "", code: "" },
      { name: "B", parent: "A", code: "" },
      { name: "C", parent: "B", code: "" },
    ];
    expect(groupAncestors(groups, "C")).toEqual(["B", "A"]);
    expect(groupParentOptions(groups, "A")).toEqual(["None (top level)"]);
    expect(groupParentOptions(groups, "C")).toEqual(["None (top level)", "A", "B"]);
  });

  it("seeds branches from UZ_BRANCHES plus UZ_LOC.branches", () => {
    expect(createSeed().settings.branches.map((b) => b.name)).toEqual(["Nairobi HQ", "Import"]);
  });
});

describe("commands", () => {
  let store: AppStore;
  beforeEach(() => {
    vi.useFakeTimers();
    store = createAppStore();
    registerStore(store);
  });
  afterEach(() => vi.useRealTimers());
  const toast = () => store.getState().ui.toast?.text;

  it("addBranchQuick follows setSync and is idempotent", () => {
    expect(addBranchQuick("Westlands")).toBe("Westlands");
    expect(addBranchQuick("westlands")).toBe("Westlands");
    const b = store.getState().settings.branches;
    expect(b).toHaveLength(3);
    expect(b[2]).toEqual({ name: "Westlands", code: "BBL-BRN-003", group: "Administration", phone: "", email: "", city: "", address: "", hq: false });
  });

  it("creates a branch with its store and an active terminal", async () => {
    const r = await saveBranch({ name: "Mombasa", phone: "", email: "", group: "Administration", city: "Mombasa", address: "", hq: false, mkStore: true, mkTerm: true });
    expect(r.message).toBe("Mombasa created. Mombasa Store added. Terminal added.");
    const s = store.getState();
    expect(s.stock.stores.find((x) => x.name === "Mombasa Store")).toEqual({ name: "Mombasa Store", branch: "Mombasa", type: "Retail" });
    expect(s.settings.pos["Mombasa Store"]).toBe(true);
    expect(s.settings.terminals.list.at(-1)).toMatchObject({ name: "Mombasa Terminal", code: "BBL-TRM-002", active: true });
    expect((await saveBranch({ name: "mombasa", phone: "", email: "", group: "Administration", city: "", address: "", hq: false })).message).toBe("Name already used");
  });

  it("renames a branch through its stores and terminals", async () => {
    await saveBranch({ name: "Nairobi Main", phone: "", email: "", group: "Administration", city: "Nairobi", address: "", hq: true }, "Nairobi HQ");
    const s = store.getState();
    expect(s.stock.stores.filter((x) => x.branch === "Nairobi Main")).toHaveLength(4);
    expect(s.settings.terminals.list[0]!.branch).toBe("Nairobi Main");
    expect(s.settings.biz.location).toBe("Nairobi Main");
    expect(toast()).toBe("Nairobi Main saved.");
  });

  it("creates a group with a branch, store and terminal", async () => {
    const r = await saveGroup({ name: "Coast", parent: "None (top level)", mkBranch: true, mkStore: true, mkTerm: true });
    expect(r.message).toBe("Coast created. Coast Branch added. Store added. Terminal added.");
    expect(store.getState().settings.groups.at(-1)).toEqual({ name: "Coast", parent: "", code: "BBL-GRP-002" });
    expect((await saveGroup({ name: "Administration", parent: "Coast" }, "Administration")).ok).toBe(true);
    expect((await saveGroup({ name: "Coast", parent: "Administration" }, "Coast")).message).toBe("A group can't be inside itself.");
  });

  it("adds terminals active with no slot limit, and toggles them freely", async () => {
    for (const name of ["Counter 2", "Counter 3", "Counter 4"]) expect((await saveTerminal({ name, branch: "Any branch", store: "Main Store" })).message).toBe(`${name} added and active.`);
    expect(activeTerminals(store.getState().settings.terminals)).toBe(4);
    const id = store.getState().settings.terminals.list.at(-1)!.id;
    expect((await setTerminalActive(id, false)).message).toBe("Counter 4 deactivated.");
    expect((await setTerminalActive(id, true)).message).toBe("Counter 4 activated.");
  });

  it("shares storage locations with Stock › Warehouses", async () => {
    await saveStorageLocation({ name: "Back Shelf", branch: "Import", type: "Store", pos: true });
    expect(toast()).toBe("Back Shelf created.");
    await saveStore({ name: "Back Shelf 2", branch: "Import", type: "Store" }, "Back Shelf");
    const s = store.getState();
    expect(s.settings.pos["Back Shelf 2"]).toBe(true);
    expect(s.settings.pos["Back Shelf"]).toBeUndefined();
    await saveTerminal({ name: "Shelf till", branch: "Import", store: "Back Shelf 2" });
    expect((await deleteStorageLocation("Back Shelf 2")).message).toBe("Move or delete its terminal first.");
    expect((await deleteStore("Main Store")).ok).toBe(false);
    expect((await deleteStore("Goods in Transit")).message).toBe("Goods in Transit deleted.");
  });

  it("creates, uploads into and deletes folders", async () => {
    const f = await createFolder("Receipts", "legal");
    expect(f.message).toBe("Receipts created in Legal.");
    const id = f.ok ? f.value.id : "";
    expect(f.ok && f.value.access).toBe("Owner only");
    const u = await uploadFile({ name: "Till slip", fileName: "IMG_1.jpg", bytes: 2048, folder: id, notes: "" });
    expect(u.message).toBe("Till slip.jpg added to Receipts.");
    expect(u.ok && u.value.owner).toBe("Tony Blaise");
    const fileId = u.ok ? u.value.id : "";
    await renameDoc("file", fileId, "Slip", "");
    expect(store.getState().docs.files.find((x) => x.id === fileId)?.name).toBe("Slip.jpg");
    const d = await deleteDoc("folder", "legal", id);
    expect(d.ok && d.value.dir).toBeNull();
    expect(store.getState().docs.files.some((x) => x.id === fileId)).toBe(false);
    expect(toast()).toBe("Legal deleted.");
  });

  it("saves and deletes events", async () => {
    expect((await saveEvent({ title: " ", date: "2026-11-20", time: "", endDate: "", endTime: "", address: "", type: "Work", notes: "" })).ok).toBe(false);
    const e = await saveEvent({ title: "Supplier visit", date: "2026-11-20", time: "", endDate: "", endTime: "", address: "", type: "Visits", notes: "" });
    expect(e.message).toBe("Event saved.");
    expect(e.ok && e.value.endDate).toBe("2026-11-20");
    expect(store.getState().calendar.types).toContain("Visits");
    expect((await deleteEvent(e.ok ? e.value.id : "")).message).toBe("Supplier visit deleted.");
  });

  it("updates the current user name from the profile", async () => {
    const p = store.getState().profiles.owner;
    expect(p).toMatchObject({ first: "Tony", last: "Blaise", email: "demo@uzapro.com" });
    expect((await saveProfile({ ...p, email: "bad" })).message).toBe("Enter a valid email address.");
    await saveProfile({ ...p, first: "Anthony" });
    expect(currentUserName(store.getState())).toBe("Anthony Blaise");
    expect(currentUserFirst(store.getState())).toBe("Anthony");
    expect((await setPhoto("data:x", { name: "a.gif", size: 10 })).message).toBe("Use a JPG or PNG image.");
    expect((await setPhoto("")).message).toBe("Photo removed.");
  });

  it("checks password rules without storing anything", async () => {
    expect((await changePassword("", "Abcdef1!")).ok).toBe(false);
    expect((await changePassword("old", "abcdefgh")).ok).toBe(false);
    expect((await changePassword("old", "Abcdef1!", "Abcdef1?")).message).toBe("The new passwords don't match.");
    expect((await changePassword("Abcdef1!", "Abcdef1!")).ok).toBe(false);
    expect((await changePassword("old", "Abcdef1!")).message).toBe("Password updated. Use it next time you log in.");
  });

  it("deletes generic rows for the owner only", async () => {
    expect(canDeleteGeneric("owner")).toBe(true);
    expect(canDeleteGeneric("accountant")).toBe(false);
    expect((await deleteGenericRow("comm", "saved-messages", "Welcome")).message).toBe("Welcome deleted.");
    expect(store.getState().generic["comm/saved-messages"]).toHaveLength(2);
  });
});
