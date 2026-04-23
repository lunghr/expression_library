import { describe, expect, it } from "vitest";

import { bindExpression, createModelCatalog, loadMetadataDocument, parseExpression, } from "../src/index.js";

function createTestCatalog() {
  return createModelCatalog(
    loadMetadataDocument({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              age: {type: "number"},
              active: {type: "boolean"},
              address: {
                type: "object",
                properties: {
                  city: {type: "string"},
                },
              },
            },
          },
        },
      ],
    }),
  );
}

describe("semantic binding", () => {
  it("binds a valid model identifier", () => {
    const parsed = parseExpression("User");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics).toHaveLength(0);
    expect(bound.root?.kind).toBe("BoundIdentifier");
    expect(bound.root?.type).toBe("object");
    expect(bound.root?.kind === "BoundIdentifier" ? bound.root.model?.name : undefined).toBe("User");
  });

  it("binds a valid nested member access chain", () => {
    const parsed = parseExpression("User.address.city");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics).toHaveLength(0);
    expect(bound.root?.kind).toBe("BoundMemberExpression");
    expect(bound.root?.type).toBe("string");
    expect(bound.root?.kind === "BoundMemberExpression" ? bound.root.field?.path : undefined).toEqual([
      "address",
      "city",
    ]);
  });

  it("reports an unknown identifier", () => {
    const parsed = parseExpression("Order.total");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM001"]);
  });

  it("reports an unknown field in member access", () => {
    const parsed = parseExpression("User.missing");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM002"]);
  });

  it("reports an invalid member access target", () => {
    const parsed = parseExpression("User.age.value");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM003"]);
  });

  it("reports incompatible operand types for arithmetic operators", () => {
    const parsed = parseExpression("User.age + User.active");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM004"]);
  });

  it("reports incompatible operand types for logical operators", () => {
    const parsed = parseExpression("User.age && User.active");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM004"]);
  });

  it("type-checks a valid mixed expression", () => {
    const parsed = parseExpression("User.age > 18 && User.active");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics).toHaveLength(0);
    expect(bound.root?.kind).toBe("BoundBinaryExpression");
    expect(bound.root?.type).toBe("boolean");
  });
});
