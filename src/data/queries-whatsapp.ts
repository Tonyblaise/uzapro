"use client";
/** WhatsApp read hooks (feature 020). */
import { useMemo } from "react";
import { balance, daysLate } from "./money";
import { useAppStore } from "./store/StoreProvider";
import { reminderMessage } from "./whatsapp";

/** A customer's phone as stored ("" when unknown or "—"). */
export function useCustomerPhone(name: string): string {
  return useAppStore((s) => {
    const p = s.customers.find((c) => c.name === name)?.phone;
    return p && p !== "—" ? p : "";
  });
}

/** When the customer was last reminded this session, or "". */
export function useLastReminder(name: string): string {
  return useAppStore((s) => s.money.reminders[name]?.at(-1) ?? "");
}

/** The reminder for a customer: every open receivable, oldest due first. "" when nothing is owed. */
export function useReminderMessage(customer: string): string {
  const receivables = useAppStore((s) => s.money.receivables);
  const biz = useAppStore((s) => s.settings.biz.name);
  return useMemo(() => {
    const items = receivables
      .filter((r) => r.party === customer && balance(r) > 0)
      .sort((a, b) => a.due.localeCompare(b.due))
      .map((r) => ({ doc: r.doc && r.doc !== "—" ? r.doc : r.ref, due: r.due, balance: balance(r), daysLate: daysLate(r.due) }));
    return items.length ? reminderMessage({ biz, customer, items }) : "";
  }, [receivables, biz, customer]);
}
