/** Run reports commands (feature 009). */
import { getStore } from "../store";
import type { ReportPeriod } from "../types";

/** Remember the period last chosen, used when the next report is run (design `repPeriod`). */
export function setReportPeriod(period: ReportPeriod): void {
  getStore().setState((s) => ({ ui: { ...s.ui, reportPeriod: period } }));
}
