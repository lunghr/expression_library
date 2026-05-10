import { describe, expect, it } from "vitest";

import {
  createDemoHostApplication,
  createDemoMetadataProvider,
  createHostApplicationAdapter,
  type ExpressionTransportRequest,
  MetadataProviderLoadError,
  MetadataProviderValidationError,
  type MetadataProviderAdapter,
} from "../src/index.js";

describe("host application adapter", () => {
  it("fails initialize with a provider load error when metadata source cannot be loaded", async () => {
    const hostApplication = createHostApplicationAdapter({
      metadataProvider: {
        loadMetadataSource() {
          throw new Error("Provider offline.");
        },
      },
      expressionTransport: {
        sendExpression() {
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

    await expect(hostApplication.initialize()).rejects.toBeInstanceOf(
      MetadataProviderLoadError,
    );
  });

  it("fails initialize with a metadata validation error when source is invalid", async () => {
    const hostApplication = createHostApplicationAdapter({
      metadataProvider: {
        loadMetadataSource() {
          return {
            models: [
              {
                name: "User",
                schema: {
                  type: "array",
                },
              },
            ],
          };
        },
      },
      expressionTransport: {
        sendExpression() {
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

    await expect(hostApplication.initialize()).rejects.toBeInstanceOf(
      MetadataProviderValidationError,
    );
  });

  it("initializes core-facing services without exposing adapter internals", async () => {
    const hostApplication = createDemoHostApplication();
    const services = await hostApplication.initialize();

    expect(services.catalog.getModel("User")?.name).toBe("User");
    expect(services.rootBindings.bindings).toEqual([
      {name: "User", modelName: "User"},
      {name: "Order", modelName: "Order"},
    ]);

    const processed = services.processExpression("User.age > 18");
    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("User.age > 18");

    const submitted = await services.submitExpression("User.age > 18");
    expect(submitted.processed.expression).toBe("User.age > 18");
    expect(submitted.transport.status).toBe("sent");

    if (submitted.transport.status !== "sent") {
      throw new Error("Expected sent transport result.");
    }

    expect(submitted.transport.request.canonicalText).toBe("User.age > 18");
    expect(submitted.transport.request.expressionJson).toMatchObject({
      type: "binary",
      operator: ">",
    });
    expect(submitted.transport.response.executionResult.status).toBe("success");
  });

  it("build processing and data transfer via demo adapters", async () => {
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
      rootBindingSource: {
        buyer: "Order",
        seller: "Order",
      },
      expressionTransport: {
        sendExpression(request) {
          sentRequests.push(request);
          return {
            expression: request.canonicalText,
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
    expect(services.rootBindings.bindings).toEqual([
      {name: "buyer", modelName: "Order"},
      {name: "seller", modelName: "Order"},
    ]);

    const processed = services.processExpression("buyer.total + seller.total");
    expect(processed.status).toBe("success");
    expect(processed.expression).toBe("buyer.total + seller.total");

    const submitted = await services.submitExpression("buyer.total + seller.total");

    expect(submitted.transport.status).toBe("sent");
    expect(sentRequests).toHaveLength(1);
    expect(sentRequests[0]?.canonicalText).toBe("buyer.total + seller.total");
    expect(sentRequests[0]?.expressionJson).toMatchObject({
      type: "binary",
      operator: "+",
    });

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

    expect(submitted.transport.request.canonicalText).toBe("User.age + 1");
    expect(submitted.transport.request.expressionJson).toMatchObject({
      type: "binary",
      operator: "+",
    });
    expect(submitted.transport.message).toBe("Network unavailable.");
  });

  it("refreshes metadata and reprocesses expressions against the updated catalog", async () => {
    const metadataProvider = createDemoMetadataProvider();
    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
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

    expect(services.catalog.getFieldByPath("User", ["address", "city"])?.name).toBe("city");

    const beforeRefresh = services.processExpression("User.address.city");
    expect(beforeRefresh.status).toBe("success");

    metadataProvider.replaceMetadataSource({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              score: { type: "number" },
            },
          },
        },
      ],
    });

    const refreshedCatalog = await services.refreshMetadata();

    expect(refreshedCatalog.getFieldByPath("User", ["address", "city"])).toBeNull();
    expect(refreshedCatalog.getField("User", "score")?.name).toBe("score");
    expect(services.catalog.getField("User", "score")?.name).toBe("score");

    const afterRefresh = services.processExpression("User.address.city");
    expect(afterRefresh.status).toBe("semantic_error");
    expect(afterRefresh.diagnostics.some((diagnostic) => diagnostic.code === "SEM002")).toBe(true);

    const newFieldResult = services.processExpression("User.score + 1");
    expect(newFieldResult.status).toBe("success");
    expect(newFieldResult.expression).toBe("User.score + 1");
  });

  it("keeps the current catalog when refreshed metadata validation fails", async () => {
    const metadataProvider = createDemoMetadataProvider();
    const hostApplication = createHostApplicationAdapter({
      metadataProvider,
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
    expect(services.catalog.getField("User", "age")?.name).toBe("age");

    metadataProvider.replaceMetadataSource({
      models: [
        {
          name: "User",
          schema: {
            type: "array",
          },
        },
      ],
    });

    await expect(services.refreshMetadata()).rejects.toBeInstanceOf(
      MetadataProviderValidationError,
    );

    expect(services.catalog.getField("User", "age")?.name).toBe("age");
    expect(services.catalog.getField("User", "score")).toBeNull();
  });

  it("keeps the current catalog when the provider fails during refresh", async () => {
    let shouldFail = false;
    const metadataProvider: MetadataProviderAdapter = {
      loadMetadataSource() {
        if (shouldFail) {
          throw new Error("Provider offline.");
        }

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
    expect(services.catalog.getField("User", "age")?.name).toBe("age");

    shouldFail = true;

    await expect(services.refreshMetadata()).rejects.toBeInstanceOf(
      MetadataProviderLoadError,
    );

    expect(services.catalog.getField("User", "age")?.name).toBe("age");
  });

  it("keeps root bindings stable when an external binding source is provided", async () => {
    const hostApplication = createHostApplicationAdapter({
      metadataProvider: {
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
      },
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
    const processed = services.processExpression("buyer.age == seller.age");

    expect(processed.status).toBe("success");
    expect(services.rootBindings.bindings).toEqual([
      {name: "buyer", modelName: "User"},
      {name: "seller", modelName: "User"},
    ]);
  });
});
