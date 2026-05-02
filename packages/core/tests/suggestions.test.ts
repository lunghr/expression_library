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
      {
        kind: "model",
        label: "User",
        insertText: "User",
        detail: "model",
        replaceSpan: {start: 0, end: 2},
      },
    ]);
  });

  it("suggests top-level fields after model member access", () => {
    const result = getSuggestions("User.", 5, createTestCatalog());

    expect(result.items.map((item) => item.label)).toEqual(["age", "active", "address"]);
    expect(result.items[0]).toMatchObject({
      kind: "field",
      label: "age",
      insertText: "age",
      detail: "number",
      replaceSpan: {start: 5, end: 5},
    });
  });

  it("suggests fields for an incomplete member prefix", () => {
    const result = getSuggestions("User.a", 6, createTestCatalog());

    expect(result.items.map((item) => item.label)).toEqual(["age", "active", "address"]);
    expect(result.items[0]?.replaceSpan).toEqual({start: 5, end: 6});
  });

  it("suggests nested fields after object member access", () => {
    const result = getSuggestions("User.address.", 13, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "field",
        label: "city",
        insertText: "city",
        detail: "string",
        replaceSpan: {start: 13, end: 13},
      },
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
    expect(result.items[0]).toMatchObject({
      kind: "operator",
      insertText: "+",
      detail: "arithmetic",
    });
  });

  it("returns no suggestions for unsupported member contexts", () => {
    const result = getSuggestions("User.age.", 9, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("returns no suggestions when no context matches", () => {
    const result = getSuggestions("$", 1, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("suggests root names after an operator with cursor in the prefix", () => {
    const result = getSuggestions("User.age + Or", 13, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "Order",
        insertText: "Order",
        detail: "model",
        replaceSpan: {start: 11, end: 13},
      },
    ]);
  });

  it("suggests nested fields in incomplete grouped expressions", () => {
    const result = getSuggestions("(User.address.", 14, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "field",
        label: "city",
        insertText: "city",
        detail: "string",
        replaceSpan: {start: 14, end: 14},
      },
    ]);
  });

  it("returns no operator suggestions for incomplete grouped expressions", () => {
    const result = getSuggestions("(User.age ", 10, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("suggests root names after an open group", () => {
    const result = getSuggestions("(Or", 3, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "Order",
        insertText: "Order",
        detail: "model",
        replaceSpan: {start: 1, end: 3},
      },
    ]);
  });

  it("suggests root names after a comma in a grouped expression", () => {
    const result = getSuggestions("(User.age, Or", 13, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "Order",
        insertText: "Order",
        detail: "model",
        replaceSpan: {start: 11, end: 13},
      },
    ]);
  });
});
