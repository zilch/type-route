import { describe, it, expect } from "vitest";

import { typeOf } from "../src/typeOf";

describe("typeOf", () => {
  it("should work with null", () => {
    expect(typeOf(null)).toBe("null");
  });

  it("should work with arrays", () => {
    expect(typeOf([])).toBe("array");
  });
});
