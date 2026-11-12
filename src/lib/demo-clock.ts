/**
 * The demo's fixed "today" (research R12). The design records new sales on 10 Nov 2026 and
 * the latest seeded stock movement is 9 Nov 2026, so the demo clock sits on 10 Nov 2026.
 */
export const DEMO_TODAY = "2026-11-10";

/** Time of day used for new records, taken from the real clock (as the design does). */
export function demoTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

/** Add whole days to an ISO date (YYYY-MM-DD). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
