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
  it("serializes every supported MVP node type to JSON AST", () => {
    const cases = [
      {
        source: "1",
        expected: {
          type: "number",
          value: 1,
          raw: "1",
          span: {start: 0, end: 1},
        },
      },
      {
        source: '"A"',
        expected: {
          type: "string",
          value: "A",
          span: {start: 0, end: 3},
        },
      },
      {
        source: "true",
        expected: {
          type: "boolean",
          value: true,
          span: {start: 0, end: 4},
        },
      },
      {
        source: "User",
        expected: {
          type: "identifier",
          name: "User",
          span: {start: 0, end: 4},
        },
      },
      {
        source: "User.age",
        expected: {
          type: "member",
          path: ["User", "age"],
          span: {start: 0, end: 8},
        },
      },
      {
        source: "-1",
        expected: {
          type: "unary",
          operator: "-",
          span: {start: 0, end: 2},
          operand: {
            type: "number",
            value: 1,
            raw: "1",
            span: {start: 1, end: 2},
          },
        },
      },
      {
        source: 'User.age + "A" == "A"',
        expected: {
          type: "binary",
          operator: "==",
          span: {start: 0, end: 21},
          left: {
            type: "binary",
            operator: "+",
            span: {start: 0, end: 14},
            left: {
              type: "member",
              path: ["User", "age"],
              span: {start: 0, end: 8},
            },
            right: {
              type: "string",
              value: "A",
              span: {start: 11, end: 14},
            },
          },
          right: {
            type: "string",
            value: "A",
            span: {start: 18, end: 21},
          },
        },
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = parseExpression(testCase.source);

      expect(parsed.diagnostics).toHaveLength(0);
      expect(parsed.root === null ? null : serializeExpressionToJsonAst(parsed.root)).toEqual(
        testCase.expected,
      );
    }
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

  it("keeps SourceSpan as optional linkage data in the JSON AST contract", () => {
    const parsed = parseExpression("User.age");
    const serialized = parsed.root === null ? null : serializeExpressionToJsonAst(parsed.root);

    expect(serialized).not.toBeNull();
    expect(serialized).toMatchObject({
      type: "member",
      path: ["User", "age"],
      span: {start: 0, end: 8},
    });
  });
});
