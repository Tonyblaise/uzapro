/** Settings pure helpers (design `bp`, `setCode`, `tm`, the group dialog's `below`; research R4–R5). */
import { BIZ_REQUIRED } from "./fixtures/settings";
import type { BizCompletion, BusinessProfile, Group, SlotKind, TerminalsState } from "./types";

/** The completion ring over the 10 required details. */
export function bizCompletion(biz: BusinessProfile): BizCompletion {
  const missing = BIZ_REQUIRED.filter((r) => !(biz[r.key] || "").trim());
  const n = missing.length;
  return {
    missing,
    pct: Math.round((100 * (BIZ_REQUIRED.length - n)) / BIZ_REQUIRED.length),
    title: n ? `${n} required ${n === 1 ? "detail" : "details"} missing` : "Profile complete",
    chips: missing.slice(0, 4),
    more: n > 4 ? `+${n - 4} more` : "",
  };
}

/** Initials for the logo placeholder (design `bp.initials`). */
export function bizInitials(name: string): string {
  return (
    (name || "?")
      .split(/\s+/)
      .filter((w) => /^[A-Za-z]/.test(w))
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

/** Next code "BBL-{prefix}-00n": the highest number in the list + 1 (design `setCode`). */
export function nextCode(prefix: "GRP" | "BRN" | "TRM" | string, list: readonly { code?: string }[]): string {
  const max = Math.max(0, ...list.map((x) => Number(String(x.code ?? "").replace(/\D/g, "")) || 0));
  return `BBL-${prefix}-${String(max + 1).padStart(3, "0")}`;
}

/** "BBL-STG-00n" by list position (design Storage locations rows). */
export function storageCode(index: number): string {
  return `BBL-STG-${String(index + 1).padStart(3, "0")}`;
}

export function slotCapacity(t: Pick<TerminalsState, "included" | "purchased">): number {
  return t.included + t.purchased;
}

export function activeTerminals(t: Pick<TerminalsState, "list">): number {
  return t.list.filter((x) => x.active).length;
}

export function slotsFree(t: TerminalsState): number {
  return Math.max(0, slotCapacity(t) - activeTerminals(t));
}

/** Every slot is in use (design `full`). */
export function slotsFull(t: TerminalsState): boolean {
  return activeTerminals(t) >= slotCapacity(t);
}

/** Active terminals fill the included slots first, in list order, then paid ones (design `slotOf`). */
export function slotKinds(t: TerminalsState): Record<number, SlotKind> {
  const out: Record<number, SlotKind> = {};
  let n = 0;
  for (const x of t.list) {
    if (!x.active) continue;
    n++;
    out[x.id] = n <= t.included ? "plan" : "paid";
  }
  return out;
}

/** Ancestors of a group, nearest first. Stops on a cycle. */
export function groupAncestors(groups: readonly Group[], name: string): string[] {
  const out: string[] = [];
  let cur = groups.find((g) => g.name === name)?.parent ?? "";
  while (cur && !out.includes(cur) && cur !== name) {
    out.push(cur);
    cur = groups.find((g) => g.name === cur)?.parent ?? "";
  }
  return out;
}

/** Every group below `name` (design `below`). */
export function groupDescendants(groups: readonly Group[], name: string, seen: Set<string> = new Set()): string[] {
  const out: string[] = [];
  for (const g of groups) {
    if (g.parent !== name || seen.has(g.name)) continue;
    seen.add(g.name);
    out.push(g.name, ...groupDescendants(groups, g.name, seen));
  }
  return out;
}

/** Parent group options for the dialog: top level, then every group except itself and its descendants. */
export function groupParentOptions(groups: readonly Group[], edit?: string): string[] {
  const bad = edit ? [edit, ...groupDescendants(groups, edit)] : [];
  return ["None (top level)", ...groups.map((g) => g.name).filter((n) => !bad.includes(n))];
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** The design's email check, used by the business profile and profile forms ("" is allowed). */
export function badEmail(v: string): boolean {
  return !!v && !EMAIL.test(v);
}
