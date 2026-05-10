import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  createRootBindingContext,
  loadMetadataDocument,
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
            },
          },
        },
      ],
    }),
  );
}

describe("end-to-end core processing", () => {
  it("returns a stable success result", () => {
    const result = processExpressionResult(
      "buyer.age > 18 && seller.active",
      createTestCatalog(),
      undefined,
      createRootBindingContext([
        {name: "buyer", modelName: "User"},
        {name: "seller", modelName: "User"},
      ]),
    );

    expect(result.status).toBe("success");
    expect(result.diagnostics).toHaveLength(0);
    expect(result.expression).toBe("buyer.age > 18 && seller.active");
  });

  it("returns a syntax failure result", () => {
    const result = processExpressionResult("&& 1", createTestCatalog());

    expect(result.status).toBe("syntax_error");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000"]);
    expect(result.expression).toBeNull();
  });

  it("returns a semantic failure result", () => {
    const result = processExpressionResult("User.age + User.active", createTestCatalog());

    expect(result.status).toBe("semantic_error");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM004"]);
    expect(result.expression).toBe("User.age + User.active");
  });
});
