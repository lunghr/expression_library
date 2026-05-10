import { describe, expect, it } from "vitest";

import { createDemoMetadataProvider, createHostApplicationAdapter } from "../src/index.js";

describe("integration flow", () => {
  it("runs metadata load, core processing, JSON AST serialization, and transport together", async () => {
    const hostApplication = createHostApplicationAdapter({
      metadataProvider: createDemoMetadataProvider(),
      rootBindingSource: {
        buyer: "User",
        seller: "User",
      },
      expressionTransport: {
        sendExpression(request) {
          return {
            expression: request.canonicalText,
            executionResult: {
              status: "success",
              value: request.expressionJson,
            },
          };
        },
      },
    });
    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("User")?.name).toBe("User");

    const processed = services.processExpression("buyer.age > 18 && seller.active");

    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("buyer.age > 18 && seller.active");
    expect(processed.expressionJson).toMatchObject({
      type: "binary",
      operator: "&&",
      left: {
        type: "binary",
        operator: ">",
      },
      right: {
        type: "member",
        path: ["seller", "active"],
      },
    });

    const submitted = await services.submitExpression("buyer.age > 18 && seller.active");

    expect(submitted.transport.status).toBe("sent");

    if (submitted.transport.status !== "sent") {
      throw new Error("Expected sent transport result.");
    }

    expect(submitted.transport.request).toMatchObject({
      source: "buyer.age > 18 && seller.active",
      canonicalText: "buyer.age > 18 && seller.active",
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
