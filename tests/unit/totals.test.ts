import { describe, expect, it } from "vitest";
import { docTotals } from "@/lib/totals";

describe("docTotals", () => {
  it("charges VAT 16% on taxable lines only (Bike Pump is zero-rated)", () => {
    const t = docTotals([
      { qty: 2, price: 345, taxable: false },
      { qty: 1, price: 1639, taxable: true },
    ]);
    expect(t.subtotal).toBe(2329);
    expect(t.vat).toBe(262.24);
    expect(t.total).toBe(2591.24);
  });
  it("applies KES and percent discounts before VAT", () => {
    expect(docTotals([{ qty: 1, price: 1000, taxable: true }], { value: 100, type: "KES" })).toEqual({ subtotal: 1000, discount: 100, vat: 144, total: 1044 });
    expect(docTotals([{ qty: 1, price: 1000, taxable: true }], { value: 10, type: "%" }).total).toBe(1044);
  });
});
