import { describe, expect, it } from "vitest";

import { createDemoHostApplication } from "../src/index.js";

describe("integration flow", () => {
  it("runs metadata load, core processing, JSON AST serialization, and transport together", async () => {
    const hostApplication = createDemoHostApplication();
    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("User")?.name).toBe("User");

    const processed = services.processExpression("User.age > 18 && User.active");

    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("User.age > 18 && User.active");
    expect(processed.expressionJson).toMatchObject({
      type: "binary",
      operator: "&&",
      left: {
        type: "binary",
        operator: ">",
      },
      right: {
        type: "member",
        path: ["User", "active"],
      },
    });

    const submitted = await services.submitExpression("User.age > 18 && User.active");

    expect(submitted.transport.status).toBe("sent");

    if (submitted.transport.status !== "sent") {
      throw new Error("Expected sent transport result.");
    }

    expect(submitted.transport.request).toMatchObject({
      source: "User.age > 18 && User.active",
      canonicalText: "User.age > 18 && User.active",
      expressionJson: {
        type: "binary",
        operator: "&&",
      },
    });
    expect(submitted.transport.response.executionResult).toEqual({
      status: "success",
      value: submitted.transport.request.expressionJson,
    });
  });
});
