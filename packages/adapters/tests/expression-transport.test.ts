import { describe, expect, it } from "vitest";

import { createDemoExpressionTransport } from "../src/index.js";

describe("expression transport adapter", () => {
  it("sends serialized expressions through the adapter contract", async () => {
    const transport = createDemoExpressionTransport();

    const response = await transport.sendExpression({
      source: "User.age > 18",
      expression: "User.age > 18",
    });

    expect(transport.sentRequests).toEqual([
      {
        source: "User.age > 18",
        expression: "User.age > 18",
      },
    ]);
    expect(response.expression).toBe("User.age > 18");
    expect(response.executionResult).toEqual({
      status: "success",
      value: "User.age > 18",
    });
  });

  it("returns a stable execution result for a serialized expression", async () => {
    const transport = createDemoExpressionTransport();

    const response = await transport.sendExpression({
      source: "User.age > 18",
      expression: "User.age > 18",
    });

    expect(response.executionResult).toEqual({
      status: "success",
      value: "User.age > 18",
    });
  });
});
