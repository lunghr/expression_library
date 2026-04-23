import { createModelCatalog, loadMetadataDocument, type ModelCatalog, } from "@expression-editor/core";

export function createDemoCatalog(): ModelCatalog {
  return createModelCatalog(
    loadMetadataDocument({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              age: {type: "number"},
              active: {type: "boolean"},
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
}
