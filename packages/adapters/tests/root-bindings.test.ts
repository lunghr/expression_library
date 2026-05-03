import { describe, expect, it } from "vitest";

import { normalizeRootBindingSource } from "../src/index.js";

describe("root binding normalization", () => {
  it("normalizes record-shaped root bindings into the core contract", () => {
    const result = normalizeRootBindingSource({
      buyer: "User",
      seller: "User",
    });

    expect(result.bindings).toEqual([
      {name: "buyer", modelName: "User"},
      {name: "seller", modelName: "User"},
    ]);
  });

  it("normalizes array-shaped root bindings into the core contract", () => {
    const result = normalizeRootBindingSource([
      {name: "buyer", modelName: "User"},
      {name: "seller", modelName: "User"},
    ]);

    expect(result.bindings).toEqual([
      {name: "buyer", modelName: "User"},
      {name: "seller", modelName: "User"},
    ]);
  });
});
