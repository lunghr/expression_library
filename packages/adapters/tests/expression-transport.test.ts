import { describe, expect, it } from "vitest";
import {
  parseExpression,
  serializeExpressionToJsonAst,
} from "@expression-editor/core";

import { createDemoExpressionTransport } from "../src/index.js";

function createExpressionJson(source: string) {
  const parsed = parseExpression(source);

  if (parsed.root === null) {
    throw new Error("Expected parsed root.");
  }

  return serializeExpressionToJsonAst(parsed.root);
}

describe("expression transport adapter", () => {
  it("sends JSON AST as the main transport payload", async () => {
    const transport = createDemoExpressionTransport();
    const expressionJson = createExpressionJson("User.age > 18");

    const response = await transport.sendExpression({
      source: "User.age > 18",
      expressionJson,
      canonicalText: "User.age > 18",
    });

    expect(transport.sentRequests).toEqual([
      {
        source: "User.age > 18",
        expressionJson,
        canonicalText: "User.age > 18",
      },
    ]);
    expect(response.expression).toBe("User.age > 18");
    expect(response.executionResult).toEqual({
      status: "success",
      value: expressionJson,
    });
  });

  it("keeps canonical text as a secondary debug field", async () => {
    const transport = createDemoExpressionTransport();
    const expressionJson = createExpressionJson("User.age > 18");

    const response = await transport.sendExpression({
      source: "User.age > 18",
      expressionJson,
      canonicalText: "User.age > 18",
    });

    expect(response.expression).toBe("User.age > 18");
    expect(response.executionResult).toEqual({
      status: "success",
      value: expressionJson,
    });
  });
});
