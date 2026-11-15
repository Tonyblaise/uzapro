/** Run reports commands (feature 009). */
import { getStore } from "../store";
import type { ReportPeriod } from "../types";

/** Remember the period (and a custom range's dates) last chosen, used when the next report is run (design `repPeriod`, `repFrom`, `repTo`). */
export function setReportPeriod(period: ReportPeriod, from = "", to = ""): void {
  getStore().setState((s) => ({ ui: { ...s.ui, reportPeriod: period, reportFrom: period === "Custom range" ? from : s.ui.reportFrom, reportTo: period === "Custom range" ? to : s.ui.reportTo } }));
}
