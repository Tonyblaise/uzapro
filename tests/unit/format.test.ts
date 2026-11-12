import { describe, expect, it } from "vitest";
import { date, kes, kesCompact, num, parseAmount, pct } from "@/lib/format";

describe("format", () => {
  it("formats compact KPI money like the design", () => {
    expect(kesCompact(4_820_000)).toBe("KES 4.82M");
    expect(kesCompact(184_000)).toBe("KES 184K");
    expect(kesCompact(38_600_000)).toBe("KES 38.6M");
    expect(kesCompact(4_380)).toBe("KES 4,380");
  });
  it("formats table and document money", () => {
    expect(num(45600)).toBe("45,600");
    expect(kes(1234)).toBe("KES 1,234.00");
  });
  it("formats dates as 12 Nov 2026", () => {
    expect(date("2026-11-12")).toBe("12 Nov 2026");
    expect(date("2026-01-05")).toBe("5 Jan 2026");
  });
  it("parses design figures", () => {
    expect(parseAmount("From 12,900")).toBe(12900);
    expect(parseAmount("−2")).toBe(-2);
    expect(pct(12.4)).toBe("12.4%");
  });
});
