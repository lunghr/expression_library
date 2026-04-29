import { describe, expect, it } from "vitest";

import {
  bindExpression,
  createDiagnostic,
  createModelCatalog,
  evaluatePreview,
  getSuggestions,
  loadMetadataDocument,
  parseExpression,
  processExpression,
  processExpressionResult,
  serializeExpression,
  serializeExpressionToJsonAst,
} from "../src/public-api.js";

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
            },
          },
        },
      ],
    }),
  );
}

describe("public api", () => {
  it("exports stable core entry points", () => {
    expect(typeof parseExpression).toBe("function");
    expect(typeof bindExpression).toBe("function");
    expect(typeof processExpression).toBe("function");
    expect(typeof processExpressionResult).toBe("function");
    expect(typeof createDiagnostic).toBe("function");
    expect(typeof getSuggestions).toBe("function");
    expect(typeof loadMetadataDocument).toBe("function");
    expect(typeof createModelCatalog).toBe("function");
    expect(typeof serializeExpression).toBe("function");
    expect(typeof serializeExpressionToJsonAst).toBe("function");
    expect(typeof evaluatePreview).toBe("function");
  });

  it("returns a stable processed result shape", () => {
    const result = processExpressionResult("User.age > 18", createTestCatalog());

    expect(result).toMatchObject({
      status: "success",
      expression: "User.age > 18",
      expressionJson: {
        type: "binary",
        operator: ">",
      },
    });
    expect(Array.isArray(result.diagnostics)).toBe(true);
    expect(result.preview).toBeNull();
  });
});
