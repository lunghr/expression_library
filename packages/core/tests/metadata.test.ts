import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  loadMetadataDocument,
  MetadataLoadError,
  processExpression,
  refreshModelCatalog,
} from "../src/index.js";

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
    ).toThrowError(MetadataLoadError);
  });

  it("rejects unsupported schema types", () => {
    expect(() =>
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                tags: {type: "array"},
              },
            },
          },
        ],
      }),
    ).toThrowError(MetadataLoadError);
  });

  it("supports local $ref inside the project metadata format", () => {
    const metadata = loadMetadataDocument({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            $defs: {
              ageField: {type: "number"},
              addressField: {
                type: "object",
                properties: {
                  city: {type: "string"},
                },
              },
            },
            properties: {
              age: {$ref: "#/$defs/ageField"},
              address: {$ref: "#/$defs/addressField"},
            },
          },
        },
      ],
    });

    expect(metadata.models[0]?.fields).toMatchObject([
      {name: "age", valueType: "number"},
      {name: "address", valueType: "object"},
    ]);
    expect(metadata.models[0]?.fields[1]?.fields[0]).toMatchObject({
      name: "city",
      valueType: "string",
    });
  });

  it("rejects broken local $ref", () => {
    expect(() =>
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                age: {$ref: "#/$defs/missingField"},
              },
            },
          },
        ],
      }),
    ).toThrowError(MetadataLoadError);
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

  it("supports repeated loading and catalog refresh", () => {
    const initialCatalog = createModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                age: {type: "number"},
              },
            },
          },
        ],
      }),
    );

    const refreshedCatalog = refreshModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                score: {type: "number"},
              },
            },
          },
        ],
      }),
    );

    expect(initialCatalog.getField("User", "age")?.name).toBe("age");
    expect(refreshedCatalog.getField("User", "age")).toBeNull();
    expect(refreshedCatalog.getField("User", "score")?.name).toBe("score");
  });

  it("changes semantic diagnostics after catalog refresh", () => {
    const initialCatalog = createModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                age: {type: "number"},
              },
            },
          },
        ],
      }),
    );

    const refreshedCatalog = refreshModelCatalog(
      loadMetadataDocument({
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                score: {type: "number"},
              },
            },
          },
        ],
      }),
    );

    const beforeRefresh = processExpression("User.age + 1", initialCatalog);
    const afterRefresh = processExpression("User.age + 1", refreshedCatalog);

    expect(beforeRefresh.diagnostics).toHaveLength(0);
    expect(afterRefresh.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM002", "SEM004"]);
  });
});
