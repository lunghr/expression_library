import { describe, expect, it } from "vitest";

import { createModelCatalog, loadMetadataDocument } from "../src/index.js";

describe("metadata foundation", () => {
  it("loads the project metadata format", () => {
    const metadata = loadMetadataDocument({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              age: {type: "number"},
              active: {type: "boolean"},
            },
          },
        },
      ],
    });

    expect(metadata.models).toHaveLength(1);
    expect(metadata.models[0]?.name).toBe("User");
    expect(metadata.models[0]?.fields.map((field) => field.name)).toEqual(["age", "active"]);
  });

  it("rejects invalid metadata documents", () => {
    expect(() =>
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "array",
            },
          },
        ],
      }),
    ).toThrowError(/Invalid project metadata document/);
  });

  it("looks up a model and direct field", () => {
    const catalog = createModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "Order",
            schema: {
              type: "object",
              properties: {
                total: {type: "number"},
              },
            },
          },
        ],
      }),
    );

    expect(catalog.getModel("Order")?.name).toBe("Order");
    expect(catalog.getField("Order", "total")).toMatchObject({
      name: "total",
      kind: "scalar",
      valueType: "number",
      path: ["total"],
    });
  });

  it("looks up a nested field by path", () => {
    const catalog = createModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                address: {
                  type: "object",
                  properties: {
                    city: {type: "string"},
                  },
                },
              },
            },
          },
        ],
      }),
    );

    expect(catalog.getFieldByPath("User", ["address", "city"])).toMatchObject({
      name: "city",
      kind: "scalar",
      valueType: "string",
      path: ["address", "city"],
    });
  });

  it("returns null for missing model or field paths", () => {
    const catalog = createModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                profile: {
                  type: "object",
                  properties: {
                    age: {type: "integer"},
                  },
                },
              },
            },
          },
        ],
      }),
    );

    expect(catalog.getModel("Order")).toBeNull();
    expect(catalog.getField("User", "missing")).toBeNull();
    expect(catalog.getFieldByPath("User", ["profile", "missing"])).toBeNull();
    expect(catalog.getFieldByPath("User", ["profile", "age", "extra"])).toBeNull();
    expect(catalog.getFieldByPath("User", [])).toBeNull();
  });
});
