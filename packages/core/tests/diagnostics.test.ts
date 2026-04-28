import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  loadMetadataDocument,
  parseExpression,
  processExpression,
  tokenize,
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
            },
          },
        },
      ],
    }),
  );
}

describe("diagnostics payload", () => {
  it("marks lexical diagnostics with severity and category", () => {
    const result = tokenize("$");

    expect(result.diagnostics[0]).toMatchObject({
      code: "LEX001",
      severity: "error",
      category: "lexical",
      message: 'Unexpected character "$".',
      span: {start: 0, end: 1},
    });
  });

  it("marks syntax diagnostics with severity and category", () => {
    const result = parseExpression("1 +");

    expect(result.diagnostics.map((diagnostic) => diagnostic.category)).toEqual([
      "syntax",
      "syntax",
    ]);
    expect(result.diagnostics.every((diagnostic) => diagnostic.severity === "error")).toBe(true);
  });

  it("marks semantic diagnostics with severity and category", () => {
    const result = processExpression("User.missing + 1", createTestCatalog());

    expect(result.diagnostics.map((diagnostic) => diagnostic.category)).toEqual([
      "semantic",
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      code: "SEM002",
      severity: "error",
      category: "semantic",
      span: {start: 5, end: 12},
    });
  });
});
