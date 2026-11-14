import { beforeEach, describe, expect, it } from "vitest";
import { noteWhatsApp } from "@/data/commands/whatsapp";
import { rowActionNeed } from "@/data/permissions";
import { createAppStore, registerStore, type AppStore } from "@/data/store";
import { invoiceMessage, receiptMessage, reminderMessage, waLink, waNumber } from "@/data/whatsapp";

let store: AppStore;
beforeEach(() => {
  store = createAppStore();
  registerStore(store);
});

describe("WhatsApp click-to-chat (feature 020)", () => {
  it("puts every Kenyan mobile format into international form, and nothing else (SC-003)", () => {
    for (const p of ["+254 712 340 118", "0712 340 118", "254712340118", "712340118", "+254-712-340-118", "(0712) 340118"]) expect(waNumber(p), p).toBe("254712340118");
    expect(waNumber("0110 123 456")).toBe("254110123456");
    for (const p of ["", "—", "12345", "0812 340 118", "07123401189", "+1 415 555 0100", "hello"]) expect(waNumber(p), p).toBeNull();
  });

  it("builds the link with the message encoded, or none for a bad number", () => {
    expect(waLink("0712 340 118", "Hello Ann,\nTotal: KES 1,000.00 & thanks")).toBe("https://wa.me/254712340118?text=Hello%20Ann%2C%0ATotal%3A%20KES%201%2C000.00%20%26%20thanks");
    expect(waLink("—", "Hello")).toBeNull();
  });

  it("writes a receipt", () => {
    const text = receiptMessage({
      biz: "Build by Blaise",
      ref: "SAL-001185",
      date: "2026-11-10",
      customer: "Mountain Goats",
      lines: [{ name: "Bike Pump · Standard", qty: 2, amount: 690 }, { name: "Helmet · Medium", qty: 1, amount: 1639 }],
      vat: 262.24,
      total: 2591.24,
      paid: "Paid by M-Pesa.",
    });
    expect(text.split("\n")).toEqual([
      "Hello Mountain Goats,",
      "Thank you for shopping at Build by Blaise. Here is your receipt SAL-001185 of 10 Nov 2026.",
      "",
      "2 x Bike Pump · Standard: KES 690.00",
      "1 x Helmet · Medium: KES 1,639.00",
      "",
      "VAT 16%: KES 262.24",
      "Total: KES 2,591.24",
      "Paid by M-Pesa.",
    ]);
    expect(receiptMessage({ biz: "B", ref: "R", date: "2026-11-10", customer: "Walk-in Customer", lines: [], total: 5, paid: "Paid by Cash." }).split("\n")[0]).toBe("Hello,");
  });

  it("writes an invoice message, paid or not", () => {
    expect(invoiceMessage({ biz: "Build by Blaise", number: "INV-0356", customer: "Mountain Goats", amount: 7600, balance: 7600, due: "2026-12-10" }).split("\n")).toEqual([
      "Hello Mountain Goats,",
      "Here is invoice INV-0356 from Build by Blaise.",
      "",
      "Amount: KES 7,600.00",
      "Balance due: KES 7,600.00",
      "Due date: 10 Dec 2026",
    ]);
    expect(invoiceMessage({ biz: "B", number: "INV-1", customer: "C", amount: 100, balance: 0, due: "2026-12-10" })).toContain("Paid in full. Thank you.");
  });

  it("writes a reminder whose total is what is owed (SC-002)", () => {
    const text = reminderMessage({
      biz: "Build by Blaise",
      customer: "Mountain Goats",
      items: [
        { doc: "SAL-1184", due: "2026-11-19", balance: 48400, daysLate: -9 },
        { doc: "INV-0362", due: "2026-12-05", balance: 32000, daysLate: -25 },
        { doc: "INV-0300", due: "2026-11-09", balance: 100, daysLate: 1 },
      ],
    });
    expect(text.split("\n")).toEqual([
      "Hello Mountain Goats,",
      "This is a reminder from Build by Blaise about amounts still to pay.",
      "",
      "SAL-1184: KES 48,400.00, due 19 Nov 2026",
      "INV-0362: KES 32,000.00, due 5 Dec 2026",
      "INV-0300: KES 100.00, overdue by 1 day",
      "",
      "Total owed: KES 80,500.00",
      "Please let us know when to expect payment. Thank you.",
    ]);
  });

  it("logs a reminder per customer, and lets read-only roles send", () => {
    noteWhatsApp("Mountain Goats", true);
    noteWhatsApp("Mountain Goats"); // a receipt is not logged
    const s = store.getState();
    expect(s.money.reminders["Mountain Goats"]).toHaveLength(1);
    expect(s.money.reminders["Mountain Goats"]![0]).toMatch(/^10 Nov 2026, \d\d:\d\d$/);
    expect(s.ui.toast?.text).toBe("WhatsApp opened for Mountain Goats.");
    expect([rowActionNeed("WhatsApp"), rowActionNeed("Send reminder")]).toEqual(["read", "read"]);
  });
});
