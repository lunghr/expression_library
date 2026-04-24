import { describe, expect, it } from "vitest";

import {
  createDemoMetadataProvider,
  loadModelCatalogFromProvider,
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
});
