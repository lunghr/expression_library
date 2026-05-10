import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  createRootBindingContext,
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

function createRootBindings() {
  return createRootBindingContext([
    {name: "buyer", modelName: "User"},
    {name: "seller", modelName: "User"},
    {name: "order", modelName: "Order"},
  ]);
}

describe("suggestions", () => {
  it("suggests root binding names for an identifier prefix", () => {
    const result = getSuggestions("bu", 2, createTestCatalog(), createRootBindings());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "buyer",
        insertText: "buyer",
        detail: "User",
        replaceSpan: {start: 0, end: 2},
      },
    ]);
  });

  it("suggests root models for an identifier prefix", () => {
    const result = getSuggestions("Us", 2, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "User",
        insertText: "User",
        detail: "User",
        replaceSpan: {start: 0, end: 2},
      },
    ]);
  });

  it("suggests top-level fields after model member access", () => {
    const result = getSuggestions("buyer.", 6, createTestCatalog(), createRootBindings());

    expect(result.items.map((item) => item.label)).toEqual(["age", "active", "address"]);
    expect(result.items[0]).toMatchObject({
      kind: "field",
      label: "age",
      insertText: "age",
      detail: "number",
      replaceSpan: {start: 6, end: 6},
    });
  });

  it("suggests fields for an incomplete member prefix", () => {
    const result = getSuggestions("buyer.a", 7, createTestCatalog(), createRootBindings());

    expect(result.items.map((item) => item.label)).toEqual(["age", "active", "address"]);
    expect(result.items[0]?.replaceSpan).toEqual({start: 6, end: 7});
  });

  it("does not suggest a field when the field name is already complete", () => {
    const result = getSuggestions("buyer.active", 12, createTestCatalog(), createRootBindings());

    expect(result.items).toEqual([]);
  });

  it("suggests nested fields after object member access", () => {
    const result = getSuggestions("seller.address.", 15, createTestCatalog(), createRootBindings());

    expect(result.items).toEqual([
      {
        kind: "field",
        label: "city",
        insertText: "city",
        detail: "string",
        replaceSpan: {start: 15, end: 15},
      },
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

  it("suggests root names after an operator with cursor in the prefix", () => {
    const result = getSuggestions("User.age + Or", 13, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "Order",
        insertText: "Order",
        detail: "Order",
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

  it("returns no root suggestions for empty input", () => {
    const result = getSuggestions("", 0, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("does not suggest a root name when it is already complete", () => {
    const result = getSuggestions("buyer", 5, createTestCatalog(), createRootBindings());

    expect(result.items).toEqual([]);
  });

  it("returns no root suggestions after an open group without a prefix", () => {
    const result = getSuggestions("(", 1, createTestCatalog());

    expect(result.items).toEqual([]);
  });

  it("suggests root names after an open group when a prefix exists", () => {
    const result = getSuggestions("(Or", 3, createTestCatalog());

    expect(result.items).toEqual([
      {
        kind: "model",
        label: "Order",
        insertText: "Order",
        detail: "Order",
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
        detail: "Order",
        replaceSpan: {start: 11, end: 13},
      },
    ]);
  });
});
