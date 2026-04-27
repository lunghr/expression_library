import { describe, expect, it } from "vitest";

import {
  createDemoHostApplication,
  createHostApplicationAdapter,
  type ExpressionTransportRequest,
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
    expect(submitted.processed.expression).toBe("User.age > 18");
    expect(submitted.transport.status).toBe("sent");

    if (submitted.transport.status !== "sent") {
      throw new Error("Expected sent transport result.");
    }

    expect(submitted.transport.request.expression).toBe("User.age > 18");
    expect(submitted.transport.response.executionResult.status).toBe("success");
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

    const sentRequests: ExpressionTransportRequest[] = [];
    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
      expressionTransport: {
        sendExpression(request) {
          sentRequests.push(request);
          return {
            expression: request.expression,
            executionResult: {
              status: "success",
              value: 125,
            },
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

    expect(submitted.transport.status).toBe("sent");
    expect(sentRequests).toHaveLength(1);
    expect(sentRequests[0]?.expression).toBe("Order.total + 5");

    if (submitted.transport.status !== "sent") {
      throw new Error("Expected sent transport result.");
    }

    expect(submitted.transport.response.executionResult).toEqual({
      status: "success",
      value: 125,
    });
  });

  it("does not call transport when expression is not ready", async () => {
    let sendCalls = 0;
    const metadataProvider: MetadataProviderAdapter = {
      loadMetadataSource() {
        return {
          models: [
            {
              name: "User",
              schema: {
                type: "object",
                properties: {
                  age: { type: "number" },
                },
              },
            },
          ],
        };
      },
    };

    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
      expressionTransport: {
        sendExpression() {
          sendCalls += 1;
          return {
            expression: null,
            executionResult: {
              status: "success",
              value: null,
            },
          };
        },
      },
    });
    const services = await hostApplication.initialize();

    const submitted = await services.submitExpression("User.age +");

    expect(submitted.processed.status).toBe("syntax_error");
    expect(submitted.transport).toEqual({
      status: "not_sent",
      reason: "Expression is not ready for transport.",
    });
    expect(sendCalls).toBe(0);
  });

  it("returns a transport error result when transport fails", async () => {
    const metadataProvider: MetadataProviderAdapter = {
      loadMetadataSource() {
        return {
          models: [
            {
              name: "User",
              schema: {
                type: "object",
                properties: {
                  age: { type: "number" },
                },
              },
            },
          ],
        };
      },
    };

    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
      expressionTransport: {
        sendExpression() {
          throw new Error("Network unavailable.");
        },
      },
    });

    const services = await hostApplication.initialize();
    const submitted = await services.submitExpression("User.age + 1");

    expect(submitted.processed.status).toBe("success");
    expect(submitted.transport.status).toBe("transport_error");

    if (submitted.transport.status !== "transport_error") {
      throw new Error("Expected transport_error result.");
    }

    expect(submitted.transport.request.expression).toBe("User.age + 1");
    expect(submitted.transport.message).toBe("Network unavailable.");
  });
});
