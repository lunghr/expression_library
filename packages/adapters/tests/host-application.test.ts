import type { ProcessedExpressionResult } from "@expression-editor/core";
import { describe, expect, it } from "vitest";

import {
  createDemoHostApplication,
  createHostApplicationAdapter,
  type MetadataProviderAdapter,
} from "../src/index.js";

describe("host application adapter", () => {
  it("initializes core-facing services without exposing adapter internals", async () => {
    const hostApplication = createDemoHostApplication();
    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("User")?.name).toBe("User");

    const processed = services.processExpression("User.age > 18");
    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("User.age > 18");

    const submitted = await services.submitExpression("User.age > 18");
    expect(submitted.accepted).toBe(true);
    expect(submitted.expression).toBe("User.age > 18");
    expect(submitted.status).toBe("success");
  });

  it("build processing and data transfer via built-in adapters", async () => {
    const metadataProvider: MetadataProviderAdapter = {
      loadMetadataSource() {
        return {
          models: [
            {
              name: "Order",
              schema: {
                type: "object",
                properties: {
                  total: { type: "number" },
                },
              },
            },
          ],
        };
      },
    };

    const sentResults: ProcessedExpressionResult[] = [];
    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
      expressionTransport: {
        sendExpression(result) {
          sentResults.push(result);
          return {
            accepted: true,
            expression: result.expression,
            status: result.status,
          };
        },
      },
    });

    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("Order")?.name).toBe("Order");

    const processed = services.processExpression("Order.total + 5");
    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("Order.total + 5");

    const submitted = await services.submitExpression("Order.total + 5");

    expect(submitted.accepted).toBe(true);
    expect(sentResults).toHaveLength(1);
    expect(sentResults[0]?.expression).toBe("Order.total + 5");
  });
});
