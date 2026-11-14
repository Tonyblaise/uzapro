/** WhatsApp commands (feature 020): note that a chat was opened. The app itself sends nothing. */
import { DEMO_TODAY, demoTime } from "@/lib/demo-clock";
import { date as fmtDate } from "@/lib/format";
import { getStore, showToast } from "../store";

/** Show "WhatsApp opened for {name}." and, for a reminder, log the time against the customer. */
export function noteWhatsApp(name: string, reminder = false): void {
  if (reminder && name) {
    const at = `${fmtDate(DEMO_TODAY)}, ${demoTime()}`;
    getStore().setState((s) => ({ money: { ...s.money, reminders: { ...s.money.reminders, [name]: [...(s.money.reminders[name] ?? []), at] } } }));
  }
  showToast(`WhatsApp opened for ${name || "this customer"}.`);
}
