/**
 * Settings commands (feature 005, US3). Validation and wording come from the design's `setModal`
 * definitions, `setSync`, `setStoreAdd`, `setTermAdd`, the Settings row actions, `bp` and `tm`
 * (design/canvas/Uzapoint ERP.dc.html, research R4–R5). The design blocks invalid input by
 * disabling the submit button; the `fail()` texts below are its inline notes, or short neutral
 * messages where it has none.
 */
import { num } from "@/lib/format";
import { TERMINAL_ADDED } from "../fixtures/settings";
import { badEmail, groupDescendants, nextCode, slotCapacity, activeTerminals } from "../settings";
import { getStore, showToast } from "../store";
import type { AppState } from "../store/state";
import {
  fail,
  ok,
  type BizSection,
  type Branch,
  type BranchInput,
  type BusinessProfile,
  type Group,
  type GroupInput,
  type Result,
  type StorageLocationInput,
  type Store,
  type Terminal,
  type TerminalInput,
} from "../types";
import { deleteStore, storeDeleteBlock, storeSaveState } from "./stock";

/** Logos and photos: up to 2 MB (design `pickLogo`, `pickPhoto`). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const NO_PARENT = "None (top level)";
const ANY_BRANCH = "Any branch";

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// ---- Pure helpers (design setStoreAdd / setTermAdd) ---------------------------------------------

/** Design `setStoreAdd`: adds "{name}" (Retail when POS, else Store) unless the name is taken. */
function storeAdd(s: AppState, name: string, branch: string, pos: boolean): { state: AppState; added: boolean } {
  if (s.stock.stores.some((x) => x.name === name)) return { state: s, added: false };
  const saved: Store = { name, branch, type: pos ? "Retail" : "Store" };
  return { state: { ...s, ...storeSaveState(s, saved, undefined, pos) }, added: true };
}

/** Design `setTermAdd`: uses a free slot, or buys one with `pay`; otherwise it is added inactive. */
function termAdd(s: AppState, o: { name: string; branch: string; store: string; pay?: boolean; active?: boolean }): { state: AppState; terminal: Terminal } {
  const T = s.settings.terminals;
  let on = o.active !== false && activeTerminals(T) < slotCapacity(T);
  let purchased = T.purchased;
  if (o.pay) {
    purchased++;
    on = true;
  }
  const terminal: Terminal = {
    id: Math.max(0, ...T.list.map((t) => t.id)) + 1,
    name: o.name,
    code: nextCode("TRM", T.list),
    branch: o.branch,
    store: o.store,
    active: on,
    added: TERMINAL_ADDED,
    main: false,
  };
  return { state: { ...s, settings: { ...s.settings, terminals: { ...T, purchased, list: [...T.list, terminal] } } }, terminal };
}

const termSuffix = (on: boolean) => (on ? " Terminal added." : " Terminal added as inactive.");

// ---- Business profile -------------------------------------------------------------------------

/** Save the edit modal (any section). Blocked by a bad email, or an empty name in the full modal. */
export async function saveBusinessProfile(patch: Partial<BusinessProfile>, section: BizSection = "all"): Promise<Result<BusinessProfile>> {
  const store = getStore();
  const clean: Partial<BusinessProfile> = {};
  for (const [k, v] of Object.entries(patch) as [keyof BusinessProfile, string][]) clean[k] = typeof v === "string" ? v.trim() : v;
  const biz: BusinessProfile = { ...store.getState().settings.biz, ...clean };
  if (badEmail(biz.email)) return fail("Check the email");
  if (section === "all" && !biz.name) return fail("Enter the business name.");
  store.setState((s) => ({ settings: { ...s.settings, biz } }));
  const message = "Business profile saved.";
  showToast(message);
  return ok(biz, message);
}

/** The logo error for a chosen file, or "" (JPG, PNG or SVG up to 2 MB). */
export function logoFileError(file: { name: string; size: number }): string {
  if (file.size > MAX_IMAGE_BYTES) return "That logo is bigger than 2 MB.";
  return "";
}

/** Set the logo (a data URL kept for the session). Pass the file to have its size checked. */
export async function setLogo(dataUrl: string, file?: { name: string; size: number }): Promise<Result<string>> {
  const err = file ? logoFileError(file) : "";
  if (err) {
    showToast(err);
    return fail(err);
  }
  getStore().setState((s) => ({ settings: { ...s.settings, biz: { ...s.settings.biz, logo: dataUrl } } }));
  const message = "Logo updated. It shows on receipts and invoices.";
  showToast(message);
  return ok(dataUrl, message);
}

// ---- Branches ---------------------------------------------------------------------------------

/**
 * A branch typed as new in another module's picker (design `setSync`): next `BBL-BRN-` code, the
 * first group, every other field empty. Silent and idempotent; returns the name.
 */
export function addBranchQuick(name: string): string {
  const n = name.trim();
  if (!n) return n;
  const store = getStore();
  const existing = store.getState().settings.branches.find((b) => same(b.name, n));
  if (existing) return existing.name;
  store.setState((s) => ({
    settings: {
      ...s.settings,
      branches: [...s.settings.branches, { name: n, code: nextCode("BRN", s.settings.branches), group: s.settings.groups[0]?.name ?? "", phone: "", email: "", city: "", address: "", hq: false }],
    },
  }));
  return n;
}

/** "Create branch" / "Save changes" (design setModal kind 'branch'). */
export async function saveBranch(input: BranchInput, edit?: string): Promise<Result<Branch>> {
  const name = input.name.trim();
  const store = getStore();
  const s0 = store.getState();
  const B = s0.settings.branches;
  if (!name) return fail("Enter a branch name.");
  if (name !== edit && B.some((b) => same(b.name, name))) return fail("Name already used");
  if (!input.group) return fail("Choose a location group.");
  if (edit && !B.some((b) => b.name === edit)) return fail("That branch is no longer listed.");
  const item = { name, phone: input.phone.trim(), email: input.email.trim(), group: input.group, city: input.city || "", address: input.address.trim(), hq: !!input.hq };

  let s: AppState = s0;
  let branches = B.map((b) => (item.hq ? { ...b, hq: false } : { ...b }));
  let saved: Branch;
  if (edit) {
    const at = branches.findIndex((b) => b.name === edit);
    const was = B[at]!.hq;
    saved = { ...branches[at]!, ...item };
    branches[at] = saved;
    if (!item.hq && was && !branches.some((b) => b.hq)) branches[at] = saved = { ...saved, hq: true };
    if (edit !== name) {
      const rn = (v: string) => (v === edit ? name : v);
      s = {
        ...s,
        stock: { ...s.stock, stores: s.stock.stores.map((x) => ({ ...x, branch: rn(x.branch) })) },
        settings: {
          ...s.settings,
          terminals: { ...s.settings.terminals, list: s.settings.terminals.list.map((t) => ({ ...t, branch: rn(t.branch) })) },
          biz: { ...s.settings.biz, location: rn(s.settings.biz.location) },
        },
      };
    }
  } else {
    saved = { ...item, code: nextCode("BRN", B) };
    branches = [...branches, saved];
    if (!branches.some((b) => b.hq)) branches[branches.length - 1] = saved = { ...saved, hq: true };
  }
  s = { ...s, settings: { ...s.settings, branches } };

  let extra = "";
  if (!edit && input.mkStore) {
    const r = storeAdd(s, `${name} Store`, name, true);
    s = r.state;
    if (r.added) {
      extra += ` ${name} Store added.`;
      if (input.mkTerm) {
        const t = termAdd(s, { name: `${name} Terminal`, branch: name, store: `${name} Store` });
        s = t.state;
        extra += termSuffix(t.terminal.active);
      }
    }
  }
  store.setState({ stock: s.stock, settings: s.settings });
  const message = (edit ? `${name} saved.` : `${name} created.`) + extra;
  showToast(message);
  return ok(saved, message);
}

/** Row action "Set as headquarters". */
export async function setHeadquarters(name: string): Promise<Result<void>> {
  const store = getStore();
  if (!store.getState().settings.branches.some((b) => b.name === name)) return fail("That branch is no longer listed.");
  store.setState((s) => ({ settings: { ...s.settings, branches: s.settings.branches.map((b) => ({ ...b, hq: b.name === name })) } }));
  const message = `${name} is now the headquarters.`;
  showToast(message);
  return ok(undefined, message);
}

/** Why a branch can't be deleted, or "" (the design disables Delete in both cases). */
export function branchDeleteBlock(s: Pick<AppState, "stock" | "settings">, name: string): string {
  if (s.settings.branches.find((b) => b.name === name)?.hq) return "The headquarters can't be deleted.";
  if (s.stock.stores.some((x) => x.branch === name)) return "Move or delete its storage locations first.";
  return "";
}

export async function deleteBranch(name: string): Promise<Result<void>> {
  const store = getStore();
  const block = branchDeleteBlock(store.getState(), name);
  if (block) return fail(block);
  store.setState((s) => ({ settings: { ...s.settings, branches: s.settings.branches.filter((b) => b.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Location groups --------------------------------------------------------------------------

/** "Create group" / "Save changes" (design setModal kind 'group'). */
export async function saveGroup(input: GroupInput, edit?: string): Promise<Result<Group>> {
  const name = input.name.trim();
  const store = getStore();
  const s0 = store.getState();
  const G = s0.settings.groups;
  if (!name) return fail("Enter a group name.");
  if (name !== edit && G.some((g) => same(g.name, name))) return fail("Name already used");
  const parent = input.parent && input.parent !== NO_PARENT ? input.parent : "";
  if (edit && !G.some((g) => g.name === edit)) return fail("That group is no longer listed.");
  if (edit && parent && (parent === edit || groupDescendants(G, edit).includes(parent))) return fail("A group can't be inside itself.");

  let s: AppState = s0;
  let saved: Group;
  if (edit) {
    const rn = (v: string) => (v === edit ? name : v);
    saved = { ...G.find((g) => g.name === edit)!, name, parent };
    s = {
      ...s,
      settings: {
        ...s.settings,
        groups: G.map((g) => (g.name === edit ? saved : { ...g, parent: rn(g.parent) })),
        branches: edit === name ? s.settings.branches : s.settings.branches.map((b) => ({ ...b, group: rn(b.group) })),
      },
    };
  } else {
    saved = { name, parent, code: nextCode("GRP", G) };
    s = { ...s, settings: { ...s.settings, groups: [...G, saved] } };
  }

  let extra = "";
  const branchName = `${name} Branch`;
  if (!edit && input.mkBranch && !s.settings.branches.some((b) => b.name === branchName)) {
    const branch: Branch = { name: branchName, code: nextCode("BRN", s.settings.branches), group: name, phone: "", email: "", city: "", address: "", hq: false };
    s = { ...s, settings: { ...s.settings, branches: [...s.settings.branches, branch] } };
    extra += ` ${branchName} added.`;
    if (input.mkStore) {
      const r = storeAdd(s, `${name} Store`, branchName, true);
      s = r.state;
      if (r.added) {
        extra += " Store added.";
        if (input.mkTerm) {
          const t = termAdd(s, { name: `${name} Terminal`, branch: branchName, store: `${name} Store` });
          s = t.state;
          extra += termSuffix(t.terminal.active);
        }
      }
    }
  }
  store.setState({ stock: s.stock, settings: s.settings });
  const message = (edit ? `${name} saved.` : `${name} created.`) + extra;
  showToast(message);
  return ok(saved, message);
}

/** Why a group can't be deleted, or "" (the design disables Delete while it is in use). */
export function groupDeleteBlock(s: Pick<AppState, "settings">, name: string): string {
  if (s.settings.branches.some((b) => b.group === name)) return "Move its branches to another group first.";
  if (s.settings.groups.some((g) => g.parent === name)) return "Move its sub-groups first.";
  return "";
}

export async function deleteGroup(name: string): Promise<Result<void>> {
  const store = getStore();
  const block = groupDeleteBlock(store.getState(), name);
  if (block) return fail(block);
  store.setState((s) => ({ settings: { ...s.settings, groups: s.settings.groups.filter((g) => g.name !== name) } }));
  const message = `${name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

// ---- Storage locations (the Stock › Warehouses records) ---------------------------------------

/** "Create" / "Save changes" (design setModal kind 'store'). Shares `storeSaveState` with Stock. */
export async function saveStorageLocation(input: StorageLocationInput, edit?: string): Promise<Result<Store>> {
  const name = input.name.trim();
  const store = getStore();
  const s0 = store.getState();
  if (!name) return fail("Enter a name.");
  if (name !== edit && s0.stock.stores.some((x) => same(x.name, name))) return fail("Name already used");
  if (!input.branch) return fail("Choose a parent branch.");
  const old = edit ? s0.stock.stores.find((x) => x.name === edit) : undefined;
  if (edit && !old) return fail("That storage location is no longer listed.");
  const saved: Store = { name, branch: input.branch, type: input.type || old?.type || "Store" };
  store.setState((s) => storeSaveState(s, saved, edit, !!input.pos));
  const message = name + (edit ? " saved." : " created.");
  showToast(message);
  return ok(saved, message);
}

/** Row action "Allow sales (POS)" / "Make storage only". The design shows no message. */
export async function setPos(name: string, on: boolean): Promise<Result<boolean>> {
  getStore().setState((s) => {
    const pos = { ...s.settings.pos };
    if (on) pos[name] = true;
    else delete pos[name];
    return { settings: { ...s.settings, pos } };
  });
  return ok(on, "");
}

/** Row action "Delete": blocked while the store holds stock or a terminal uses it. */
export async function deleteStorageLocation(name: string): Promise<Result<void>> {
  const block = storeDeleteBlock(getStore().getState(), name);
  if (block) return fail(block);
  return deleteStore(name);
}

/** A new storage location type from the dialog's Type picker (design `UZ_LOC.types` concat). */
export function addLocationType(name: string): string {
  const n = name.trim();
  if (!n) return n;
  const store = getStore();
  if (!store.getState().settings.locTypes.some((t) => same(t, n))) store.setState((s) => ({ settings: { ...s.settings, locTypes: [...s.settings.locTypes, n] } }));
  return n;
}

// ---- Terminals --------------------------------------------------------------------------------

/**
 * "Add terminal" / "Save changes" (design setModal kind 'term'). When every slot is in use a new
 * terminal needs `choice`: "pay" (Pay and activate) or "inactive" (Add as inactive, the default).
 */
export async function saveTerminal(input: TerminalInput, edit?: number): Promise<Result<Terminal>> {
  const name = input.name.trim();
  if (!name || !input.store) return fail("Enter a terminal name and choose a storage location.");
  const store = getStore();
  const s0 = store.getState();
  const T = s0.settings.terminals;
  const branch = !input.branch || input.branch === ANY_BRANCH ? "" : input.branch;
  if (edit !== undefined) {
    const t = T.list.find((x) => x.id === edit);
    if (!t) return fail("That terminal is no longer listed.");
    const saved: Terminal = { ...t, name, branch, store: input.store };
    store.setState((s) => ({ settings: { ...s.settings, terminals: { ...s.settings.terminals, list: s.settings.terminals.list.map((x) => (x.id === edit ? saved : x)) } } }));
    const message = `${name} saved.`;
    showToast(message);
    return ok(saved, message);
  }
  const needChoice = activeTerminals(T) >= slotCapacity(T);
  const pay = needChoice && input.choice === "pay";
  const r = termAdd(s0, { name, branch, store: input.store, pay, active: !(needChoice && !pay) });
  store.setState({ settings: r.state.settings });
  const message = name + (r.terminal.active ? " added and active." : " added as inactive.");
  showToast(message);
  return ok(r.terminal, message);
}

/** Card action "Activate" / "Deactivate" (design `tm.cards.toggle`). */
export async function setTerminalActive(id: number, on: boolean): Promise<Result<Terminal>> {
  const store = getStore();
  const T = store.getState().settings.terminals;
  const t = T.list.find((x) => x.id === id);
  if (!t) return fail("That terminal is no longer listed.");
  if (on && !t.active && activeTerminals(T) >= slotCapacity(T)) {
    const message = "All slots are in use. Deactivate a terminal or add a paid slot first.";
    showToast(message);
    return fail(message);
  }
  const saved: Terminal = { ...t, active: on };
  store.setState((s) => ({ settings: { ...s.settings, terminals: { ...s.settings.terminals, list: s.settings.terminals.list.map((x) => (x.id === id ? saved : x)) } } }));
  const message = t.name + (on ? " activated." : " deactivated.");
  showToast(message);
  return ok(saved, message);
}

/** Card action "Delete": not the main terminal, nor the last one (the design disables it). */
export async function deleteTerminal(id: number): Promise<Result<void>> {
  const store = getStore();
  const T = store.getState().settings.terminals;
  const t = T.list.find((x) => x.id === id);
  if (!t) return fail("That terminal is no longer listed.");
  if (t.main) return fail("The main terminal can't be deleted.");
  if (T.list.length < 2) return fail("You need at least one terminal.");
  store.setState((s) => ({ settings: { ...s.settings, terminals: { ...s.settings.terminals, list: s.settings.terminals.list.filter((x) => x.id !== id) } } }));
  const message = `${t.name} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Add a paid slot" (design `tm.buySlot`). */
export async function addPaidSlot(): Promise<Result<number>> {
  const store = getStore();
  store.setState((s) => ({ settings: { ...s.settings, terminals: { ...s.settings.terminals, purchased: s.settings.terminals.purchased + 1 } } }));
  const T = store.getState().settings.terminals;
  const message = `Paid slot added (KES ${num(T.price)} a month).`;
  showToast(message);
  return ok(T.purchased, message);
}
