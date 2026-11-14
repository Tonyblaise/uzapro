import { describe, expect, it } from "vitest";
import { breakFor, priceFor, priceNote, seedPricing, standardPrice, unitsOf, validateEntry, validateGroupName, RETAIL_GROUP } from "@/data/pricing";
import { createSeed } from "@/data/store/seed";
import type { PriceEntry, Variant } from "@/data/types";

const seed = createSeed();
const variantOf = (product: string, variant: string): Variant => seed.catalog.products.find((p) => p.name === product)!.variants.find((v) => v.name === variant)!;
const helmet = variantOf("Helmet", "Medium");
const prices = seed.pricing.prices;
const at = (group: string, product: string, variant: string, unit: string, qty: number) => priceFor({ prices, group, product, variant: variantOf(product, variant), unit, qty });

describe("pricing rules (feature 012)", () => {
  it("gives the standard price per unit (research R3)", () => {
    expect(unitsOf(helmet)).toEqual(["Piece", "Carton"]);
    expect(standardPrice(helmet, "Piece")).toBe(1639);
    expect(standardPrice(helmet, "Carton")).toBe(16390);
    expect(standardPrice(helmet, "Pallet")).toBe(1639);
  });

  it("picks the highest break at or below the quantity", () => {
    const e = { breaks: [{ from: 1, price: 30 }, { from: 20, price: 10 }, { from: 5, price: 20 }] };
    expect(breakFor(e, 1)?.price).toBe(30);
    expect(breakFor(e, 4)?.price).toBe(30);
    expect(breakFor(e, 5)?.price).toBe(20);
    expect(breakFor(e, 19)?.price).toBe(20);
    expect(breakFor(e, 500)?.price).toBe(10);
    expect(breakFor({ breaks: [{ from: 2, price: 9 }] }, 1)).toBeUndefined();
  });

  it("fills in the group price and changes at a break (quickstart 1)", () => {
    expect(at("g-distributor", "Helmet", "Medium", "Carton", 2)).toEqual({ price: 14900, source: "list", group: "g-distributor" });
    expect(at("g-distributor", "Helmet", "Medium", "Carton", 5).price).toBe(14400);
    expect(at("g-distributor", "Helmet", "Medium", "Carton", 20).price).toBe(13900);
    expect(at("g-wholesale", "Helmet", "Medium", "Carton", 5).price).toBe(15000);
  });

  it("falls back to the standard price for Retail and for unpriced variants and units", () => {
    expect(at(RETAIL_GROUP, "Helmet", "Medium", "Carton", 5)).toEqual({ price: 16390, source: "std" });
    expect(at("g-distributor", "Helmet", "Medium", "Piece", 5)).toEqual({ price: 1639, source: "std" });
    expect(at("g-wholesale", "Bike Pump", "Standard", "Box", 3)).toEqual({ price: 4140, source: "std" });
    expect(at("g-unknown", "Helmet", "Medium", "Carton", 5).source).toBe("std");
  });

  it("hints when the quantity is below the first break (quickstart 2)", () => {
    const below = at("g-wholesale", "Muthokinju Paint", "White", "Tray", 1);
    expect(below).toEqual({ price: 2802, source: "std", group: "g-wholesale", hint: { from: 2, unit: "Tray" } });
    expect(priceNote(below, "Wholesale")).toBe("Wholesale price from 2 Tray");
    const reached = at("g-wholesale", "Muthokinju Paint", "White", "Tray", 2);
    expect(reached.price).toBe(2700);
    expect(priceNote(reached, "Wholesale")).toBe("Wholesale price");
    expect(priceNote({ price: 1, source: "std" }, "Wholesale")).toBe("");
  });

  it("seeds list prices below standard, for real variants and units, Distributor at or below Wholesale (SC-002)", () => {
    expect(prices).toHaveLength(12);
    for (const e of prices) {
      const v = variantOf(e.product, e.variant);
      expect(unitsOf(v), `${e.product} ${e.variant}`).toContain(e.unit);
      const std = standardPrice(v, e.unit);
      let last = Infinity;
      for (const b of e.breaks) {
        expect(b.price).toBeLessThan(std);
        expect(b.price).toBeLessThan(last);
        last = b.price;
        expect(priceFor({ prices, group: e.group, product: e.product, variant: v, unit: e.unit, qty: b.from }).price).toBe(b.price);
      }
      expect(validateEntry(e, prices, e)).toBeNull();
    }
    for (const w of prices.filter((e) => e.group === "g-wholesale")) {
      const d = prices.find((e) => e.group === "g-distributor" && e.product === w.product && e.variant === w.variant && e.unit === w.unit);
      if (d) expect(d.breaks[0]!.price).toBeLessThanOrEqual(w.breaks[0]!.price);
    }
  });

  it("validates a price entry", () => {
    const e = (o: Partial<PriceEntry>): PriceEntry => ({ group: "g-wholesale", product: "Bike Pump", variant: "Standard", unit: "Box", breaks: [{ from: 1, price: 3600 }], ...o });
    expect(validateEntry(e({}), prices)).toBeNull();
    expect(validateEntry(e({ unit: "" }), prices)).toBe("Pick a product, variant and unit");
    expect(validateEntry(e({ breaks: [] }), prices)).toBe("Enter a quantity of 1 or more");
    expect(validateEntry(e({ breaks: [{ from: 0, price: 5 }] }), prices)).toBe("Enter a quantity of 1 or more");
    expect(validateEntry(e({ breaks: [{ from: 1.5, price: 5 }] }), prices)).toBe("Enter a quantity of 1 or more");
    expect(validateEntry(e({ breaks: [{ from: 1, price: 0 }] }), prices)).toBe("Enter a price above 0");
    expect(validateEntry(e({ breaks: [{ from: 3, price: 5 }, { from: 3, price: 4 }] }), prices)).toBe("Two breaks start at 3");
    expect(validateEntry(e({ unit: "Piece" }), prices)).toBe("This list already has a price for Bike Pump (Standard, Piece). Edit that one.");
  });

  it("validates a group name", () => {
    const groups = seedPricing().groups;
    expect(groups.map((g) => [g.name, g.builtIn])).toEqual([["Retail", true], ["Wholesale", false], ["Distributor", false]]);
    expect(validateGroupName("Schools", groups)).toBeNull();
    expect(validateGroupName("  ", groups)).toBe("Enter a name");
    expect(validateGroupName("wholesale", groups)).toBe("Another group is already called wholesale.");
    expect(validateGroupName("wholesale", groups, "g-wholesale")).toBeNull();
    expect(validateGroupName("x".repeat(41), groups)).toBe("Use 40 characters or fewer");
  });
});
