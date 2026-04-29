import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  loadMetadataDocument,
  parseExpression,
  processExpression,
  processExpressionResult,
  serializeExpression,
  serializeExpressionToJsonAst,
  type CoreProcessedExpressionResult,
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
              age: {type: "number"},
              active: {type: "boolean"},
            },
          },
        },
      ],
    }),
  );
}

describe("serialization", () => {
  it("serializes expressions to structural JSON AST", () => {
    const parsed = parseExpression("sum(User.age) + -1");

    expect(parsed.diagnostics).toHaveLength(0);
    expect(parsed.root === null ? null : serializeExpressionToJsonAst(parsed.root)).toEqual({
      type: "binary",
      operator: "+",
      span: {start: 0, end: 18},
      left: {
        type: "function_call",
        functionName: "sum",
        span: {start: 0, end: 13},
        arguments: [
          {
            type: "member",
            path: ["User", "age"],
            span: {start: 4, end: 12},
          },
        ],
      },
      right: {
        type: "unary",
        operator: "-",
        span: {start: 16, end: 18},
        operand: {
          type: "number",
          value: 1,
          raw: "1",
          span: {start: 17, end: 18},
        },
      },
    });
  });

  it("keeps canonical text serialization as a secondary format", () => {
    const parsed = parseExpression('("A" != "B") && true');

    expect(parsed.diagnostics).toHaveLength(0);
    expect(parsed.root === null ? null : serializeExpression(parsed.root)).toBe('"A" != "B" && true');
  });

  it("returns text and JSON serialization from the internal pipeline", () => {
    const result = processExpression("User.age > 18", createTestCatalog());

    expect(result.serialized).toBe("User.age > 18");
    expect(result.serializedJson).toMatchObject({
      type: "binary",
      operator: ">",
      left: {
        type: "member",
        path: ["User", "age"],
      },
      right: {
        type: "number",
        value: 18,
      },
    });
  });

  it("returns transport-ready JSON from the public processed result", () => {
    const result: CoreProcessedExpressionResult = processExpressionResult(
      "User.active == true",
      createTestCatalog(),
    );

    expect(result.status).toBe("success");
    expect(result.expression).toBe("User.active == true");
    expect(result.expressionJson).toMatchObject({
      type: "binary",
      operator: "==",
      left: {
        type: "member",
        path: ["User", "active"],
      },
      right: {
        type: "boolean",
        value: true,
      },
    });
  });
});
