import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
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
    const result = processExpressionResult("User.age > 18 && User.active", createTestCatalog());

    expect(result.status).toBe("success");
    expect(result.diagnostics).toHaveLength(0);
    expect(result.expression).toBe("User.age > 18 && User.active");
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
