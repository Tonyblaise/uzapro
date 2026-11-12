/** Sales target progress — the design's `tgAchieved`, shared by Sales › Targets and the Sales targets report. */
import type { Sale, SalesTarget, Store } from "./types";

/** Achieved = the design's base figure plus session sales in the target's dates that match its scope. */
export function targetAchieved(t: SalesTarget, sales: readonly Sale[], stores: readonly Store[]): number {
  const branchOf = (store: string) => {
    const b = stores.find((s) => s.name === store)?.branch;
    return b && b !== "—" ? b : "Nairobi HQ";
  };
  return (
    (t.base || 0) +
    sales
      .filter((s) => s.session && s.date >= t.start && s.date <= t.end)
      .filter((s) => t.scope === "Whole business" || (t.scope === "Staff member" && s.by === t.who) || (t.scope === "Branch" && branchOf(s.store) === t.who))
      .reduce((a, s) => a + s.total, 0)
  );
}
