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

  it("binds string and boolean literals", () => {
    const stringParsed = parseExpression('"Moscow"');
    const booleanParsed = parseExpression("false");
    const catalog = createTestCatalog();
    const stringBound = bindExpression(stringParsed.root, catalog);
    const booleanBound = bindExpression(booleanParsed.root, catalog);

    expect(stringBound.root?.kind).toBe("BoundStringLiteral");
    expect(stringBound.root?.type).toBe("string");
    expect(booleanBound.root?.kind).toBe("BoundBooleanLiteral");
    expect(booleanBound.root?.type).toBe("boolean");
  });

  it("binds operator definitions on binary expressions", () => {
    const parsed = parseExpression("User.age + 1");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(bound.diagnostics).toHaveLength(0);
    expect(bound.root?.kind).toBe("BoundBinaryExpression");
    expect(bound.root?.kind === "BoundBinaryExpression" ? bound.root.operatorDefinition.category : undefined).toBe("arithmetic");
  });

  it("binds unary operators and reports invalid unary operands", () => {
    const validParsed = parseExpression("!User.active");
    const invalidParsed = parseExpression("-User.active");
    const catalog = createTestCatalog();
    const validBound = bindExpression(validParsed.root, catalog);
    const invalidBound = bindExpression(invalidParsed.root, catalog);

    expect(validBound.diagnostics).toHaveLength(0);
    expect(validBound.root?.kind).toBe("BoundUnaryExpression");
    expect(validBound.root?.type).toBe("boolean");
    expect(validBound.root?.kind === "BoundUnaryExpression" ? validBound.root.operatorDefinition.category : undefined).toBe("logical");
    expect(invalidBound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM008"]);
  });

  it("allows equality for matching primitive types", () => {
    const parsed = parseExpression('"Moscow" == User.address.city');
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics).toHaveLength(0);
    expect(bound.diagnostics).toHaveLength(0);
    expect(bound.root?.type).toBe("boolean");
  });

  it("reports an unknown identifier for invalid call-like syntax", () => {
    const parsed = parseExpression("Calc(User.age)");
    const bound = bindExpression(parsed.root, createTestCatalog());

    expect(parsed.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR003"]);
    expect(bound.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM001"]);
  });
});
