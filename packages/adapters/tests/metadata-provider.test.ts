import { describe, expect, it } from "vitest";

import {
  createDemoMetadataProvider,
  loadModelCatalogFromProvider,
  type DemoMetadataProviderAdapter,
} from "../src/index.js";

describe("metadata provider adapter", () => {
  it("loads a model catalog from the demo provider", async () => {
    const catalog = await loadModelCatalogFromProvider(
      createDemoMetadataProvider(),
    );

    expect(catalog.getModel("User")?.name).toBe("User");
    expect(catalog.getField("User", "age")?.name).toBe("age");
    expect(catalog.getFieldByPath("User", ["address", "city"])?.name).toBe("city");
  });

  it("loads updated metadata after provider source replacement", async () => {
    const provider: DemoMetadataProviderAdapter = createDemoMetadataProvider();

    provider.replaceMetadataSource({
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
    });

    const catalog = await loadModelCatalogFromProvider(provider);

    expect(catalog.getModel("User")).toBeNull();
    expect(catalog.getModel("Order")?.name).toBe("Order");
    expect(catalog.getField("Order", "total")?.name).toBe("total");
  });
});
