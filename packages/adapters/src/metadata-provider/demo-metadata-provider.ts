import type { MetadataProviderAdapter } from "./contracts.js";

export function createDemoMetadataProvider(): MetadataProviderAdapter {
  return {
    loadMetadataSource() {
      return {
        models: [
          {
            name: "User",
            schema: {
              type: "object",
              properties: {
                age: { type: "number" },
                active: { type: "boolean" },
                address: {
                  type: "object",
                  properties: {
                    city: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      };
    },
  };
}
