import { describe, expect, it } from "vitest";
import { nextRef } from "@/lib/refs";

describe("nextRef", () => {
  it("continues the highest suffix", () => {
    expect(nextRef(["VOID-0001"], "VOID-", 4)).toBe("VOID-0002");
    expect(nextRef(["TRF-0030", "TRF-0032", "TRF-0031"], "TRF-", 4)).toBe("TRF-0033");
    expect(nextRef(["Q-001002", "Q-001001"], "Q-", 6)).toBe("Q-001003");
  });
  it("respects a floor and ignores other prefixes", () => {
    expect(nextRef(["INV-0355"], "INV-", 4, 362)).toBe("INV-0363");
    expect(nextRef(["GRN-0041"], "WST-", 4)).toBe("WST-0001");
  });
});
