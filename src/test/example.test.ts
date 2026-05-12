import { describe, it, expect } from "vitest";
import { cleanRut, formatRut, isValidRut } from "@/lib/format";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("RUT formatting and validation", () => {
  it("accepts Chilean RUT format with verifier K", () => {
    expect(formatRut("1000005k")).toBe("1.000.005-K");
    expect(cleanRut("1.000.005-k")).toBe("1000005K");
    expect(isValidRut("1.000.005-K")).toBe(true);
    expect(isValidRut("1000019-k")).toBe(true);
  });

  it("does not reject RUTs by modulo 11 verifier", () => {
    expect(isValidRut("23.456.789-K")).toBe(true);
    expect(isValidRut("23.456.789-0")).toBe(true);
  });

  it("rejects values that are not RUT-like", () => {
    expect(isValidRut("K")).toBe(false);
    expect(isValidRut("abc")).toBe(false);
  });
});
