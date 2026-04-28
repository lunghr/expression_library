import { describe, expect, it } from "vitest";

import {
  bindExpression,
  createModelCatalog,
  evaluatePreview,
  loadMetadataDocument,
  parseExpression,
  processExpressionResult,
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

describe("preview evaluation", () => {
  it("evaluates a numeric literal as known", () => {
    const parsed = parseExpression("1");
    const bound = bindExpression(parsed.root, createTestCatalog());
    const result = evaluatePreview(bound.root, {});

    expect(result).toEqual({
      status: "known",
      value: 1,
    });
  });

  it("evaluates string, boolean, and unary expressions as known", () => {
    const result = processExpressionResult(
      '!false == true && "A" != "B"',
      createTestCatalog(),
      {},
    );

    expect(result.preview).toEqual({
      status: "known",
      value: true,
    });
  });

  it("evaluates supported operators to a known boolean result", () => {
    const result = processExpressionResult(
      "User.age > 18 && User.active",
      createTestCatalog(),
      {
        User: {
          age: 20,
          active: true,
        },
      },
    );

    expect(result.preview).toEqual({
      status: "known",
      value: true,
    });
  });

  it("returns unknown when preview data is missing", () => {
    const result = processExpressionResult(
      "User.address.city",
      createTestCatalog(),
      {
        User: {
          age: 20,
          active: true,
        },
      },
    );

    expect(result.preview).toEqual({
      status: "unknown",
    });
  });

  it("returns an error for an invalid preview scenario", () => {
    const result = processExpressionResult(
      "User.age / 0",
      createTestCatalog(),
      {
        User: {
          age: 20,
          active: true,
        },
      },
    );

    expect(result.preview).toEqual({
      status: "error",
      message: "Division by zero cannot be previewed.",
    });
  });

  it("evaluates previewable built-in functions when values are known", () => {
    const result = processExpressionResult(
      "sum(User.age) + avg(User.age)",
      createTestCatalog(),
      {
        User: {
          age: 20,
          active: true,
        },
      },
    );

    expect(result.preview).toEqual({
      status: "known",
      value: 40,
    });
  });

  it("evaluates count when the preview value is a known array", () => {
    const result = processExpressionResult(
      "count(User)",
      createTestCatalog(),
      {
        User: [1, 2, 3],
      },
    );

    expect(result.preview).toEqual({
      status: "known",
      value: 3,
    });
  });

  it("returns an error for a semantically invalid previewed function call", () => {
    const result = processExpressionResult(
      "avg(User.active)",
      createTestCatalog(),
      {
        User: {
          age: 20,
          active: true,
        },
      },
    );

    expect(result.preview).toEqual({
      status: "error",
      message: 'Function "avg" requires a numeric preview value.',
    });
  });
});
