/**
 * WhatsApp click-to-chat (feature 020, research R1–R2). Pure: a phone number in international
 * form, the link, and the messages. The app sends nothing; the user sends from their own WhatsApp.
 */
import { date as fmtDate, kes } from "@/lib/format";

/** A Kenyan mobile number as WhatsApp wants it ("254712340118"), or null when it is not one. */
export function waNumber(phone: string): string | null {
  const d = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = d.startsWith("254") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return /^[71]\d{8}$/.test(local) ? `254${local}` : null;
}

/** https://wa.me/<number>?text=<message>, or null when the number is not valid. */
export function waLink(phone: string, text: string): string | null {
  const n = waNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

const greet = (customer: string) => (customer && customer !== "Walk-in Customer" ? `Hello ${customer},` : "Hello,");

export function receiptMessage(a: { biz: string; ref: string; date: string; customer: string; lines: readonly { name: string; qty: number; amount: number }[]; total: number; paid: string; /** VAT added on top of the line amounts, when they are before VAT. */ vat?: number }): string {
  return [
    greet(a.customer),
    `Thank you for shopping at ${a.biz}. Here is your receipt ${a.ref} of ${fmtDate(a.date)}.`,
    "",
    ...a.lines.map((l) => `${l.qty} x ${l.name}: ${kes(l.amount)}`),
    "",
    ...(a.vat ? [`VAT 16%: ${kes(a.vat)}`] : []),
    `Total: ${kes(a.total)}`,
    a.paid,
  ].join("\n");
}

export function invoiceMessage(a: { biz: string; number: string; customer: string; amount: number; balance: number; due: string }): string {
  return [
    greet(a.customer),
    `Here is invoice ${a.number} from ${a.biz}.`,
    "",
    `Amount: ${kes(a.amount)}`,
    a.balance > 0 ? `Balance due: ${kes(a.balance)}` : "Paid in full. Thank you.",
    ...(a.balance > 0 && a.due ? [`Due date: ${fmtDate(a.due)}`] : []),
  ].join("\n");
}

export function reminderMessage(a: { biz: string; customer: string; items: readonly { doc: string; due: string; balance: number; daysLate: number }[] }): string {
  const total = a.items.reduce((s, i) => s + i.balance, 0);
  return [
    greet(a.customer),
    `This is a reminder from ${a.biz} about ${a.items.length === 1 ? "an amount" : "amounts"} still to pay.`,
    "",
    ...a.items.map((i) => `${i.doc}: ${kes(i.balance)}, ${i.daysLate > 0 ? `overdue by ${i.daysLate} ${i.daysLate === 1 ? "day" : "days"}` : `due ${fmtDate(i.due)}`}`),
    "",
    `Total owed: ${kes(total)}`,
    "Please let us know when to expect payment. Thank you.",
  ].join("\n");
}
