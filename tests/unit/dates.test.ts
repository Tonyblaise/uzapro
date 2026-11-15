import { describe, expect, it } from "vitest";
import { dateToIso, isoToDate, parseTypedDate } from "@/lib/dates";

describe("date picker helpers", () => {
  it("parses typed dates day first, ISO, or with a month name", () => {
    expect(parseTypedDate("2026-11-12")).toBe("2026-11-12");
    expect(parseTypedDate("12/11/2026")).toBe("2026-11-12");
    expect(parseTypedDate("1-2-2026")).toBe("2026-02-01");
    expect(parseTypedDate("12 Nov 2026")).toBe("2026-11-12");
    expect(parseTypedDate(" 3 september 2026 ")).toBe("2026-09-03");
  });

  it("refuses dates that don't exist or aren't dates", () => {
    for (const t of ["31/02/2026", "2026-13-01", "12 Foo 2026", "12/11", "", "tomorrow"]) expect(parseTypedDate(t)).toBeNull();
  });

  it("round-trips ISO and calendar dates without time-zone shifts", () => {
    expect(dateToIso(isoToDate("2026-11-01")!)).toBe("2026-11-01");
    expect(isoToDate("nope")).toBeUndefined();
  });
});
