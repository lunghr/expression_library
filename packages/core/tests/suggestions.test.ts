import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  getSuggestions,
  loadMetadataDocument,
} from "../src/index.js";

function createTestCatalog() {
  return createModelCatalog(
    loadMetadataDocument({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              age: { type: "number" },
              active: { type: "boolean" },
              address: {
                type: "object",
                properties: {
                  city: { type: "string" },
                },
              },
            },
          },
        },
        {
          name: "Order",
          schema: {
            type: "object",
            properties: {
              total: { type: "number" },
            },
          },
        },
      ],
    }),
  );
}

describe("suggestions", () => {
  it("suggests root models for an identifier prefix", () => {
    const result = getSuggestions("Us", 2, createTestCatalog());

    expect(result.items).toEqual([
      { kind: "model", label: "User" },
    ]);
  });

  it("suggests top-level fields after model member access", () => {
    const result = getSuggestions("User.", 5, createTestCatalog());

    expect(result.items).toEqual([
      { kind: "field", label: "age" },
      { kind: "field", label: "active" },
      { kind: "field", label: "address" },
    ]);
  });

  it("suggests nested fields after object member access", () => {
    const result = getSuggestions("User.address.", 13, createTestCatalog());

    expect(result.items).toEqual([
      { kind: "field", label: "city" },
    ]);
  });

  it("suggests operators after a complete expression fragment", () => {
    const result = getSuggestions("User.age ", 9, createTestCatalog());

    expect(result.items.map((item) => item.label)).toEqual([
      "+",
      "-",
      "*",
      "/",
      "==",
      "!=",
      "<",
      "<=",
      ">",
      ">=",
      "&&",
      "||",
    ]);
  });

  it("returns no suggestions for unsupported member contexts", () => {
    const result = getSuggestions("User.age.", 9, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("returns no suggestions when no context matches", () => {
    const result = getSuggestions("$", 1, createTestCatalog());

    expect(result.items).toEqual([]);
  });
});
