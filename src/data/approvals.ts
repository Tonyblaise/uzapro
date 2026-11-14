/**
 * Approval rights and discount limits per role (feature 018). These are decisions, not access to
 * a screen, so they sit next to the module switches from feature 011 instead of on a module row.
 */
import type { PermissionsState, RoleApprovals } from "./types";

export const FULL_APPROVALS: RoleApprovals = { credit: true, counts: true, dispatch: true, discountMax: 100 };
export const NO_APPROVALS: RoleApprovals = { credit: false, counts: false, dispatch: false, discountMax: 0 };

export type ApprovalKey = "credit" | "counts" | "dispatch";
export const APPROVAL_KEYS: readonly ApprovalKey[] = ["credit", "counts", "dispatch"];
export const APPROVAL_LABEL: Record<ApprovalKey, string> = {
  credit: "Approve credit over the limit",
  counts: "Approve stock counts",
  dispatch: "Dispatch sales orders",
};

/**
 * Seed (spec FR-003, research R4). Parity with what each role could do before this feature: the
 * Accountant approved credit (Write on Receivables) and could dispatch (Write on Sales); only the
 * Owner approved stock counts (Delete on Stock). The discount limits are new values.
 */
export function seedApprovals(): Record<string, RoleApprovals> {
  return {
    owner: { ...FULL_APPROVALS },
    accountant: { credit: true, counts: false, dispatch: true, discountMax: 20 },
    cashier: { credit: false, counts: false, dispatch: false, discountMax: 5 },
    store: { credit: false, counts: false, dispatch: false, discountMax: 0 },
  };
}

type WithPermissions = { permissions: Pick<PermissionsState, "approvals" | "roles"> };

/** A role's approvals; the locked Owner role always has all of them. */
export function approvalsFor(s: WithPermissions, key: string): RoleApprovals {
  if (s.permissions.roles.find((r) => r.key === key)?.locked) return FULL_APPROVALS;
  return s.permissions.approvals[key] ?? NO_APPROVALS;
}

/** The signed-in role's approvals. */
export function myApprovals(s: WithPermissions & { session: { role: string } }): RoleApprovals {
  return approvalsFor(s, s.session.role);
}

export const sameApprovals = (a: RoleApprovals, b: RoleApprovals) => a.credit === b.credit && a.counts === b.counts && a.dispatch === b.dispatch && a.discountMax === b.discountMax;

export const validDiscountMax = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;

/** The discount as a percentage of the amount before it, to one decimal place. */
export function discountGiven(before: number, discount: number): number {
  return before > 0 && discount > 0 ? Math.round((discount / before) * 1000) / 10 : 0;
}

/** The refusal for a discount above the role's limit, or null. */
export function discountBlock(max: number, before: number, discount: number): string | null {
  const given = discountGiven(before, discount);
  return given > max ? `Your role can give discounts up to ${max}%. This one is ${given}%.` : null;
}
