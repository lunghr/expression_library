import type { MetadataProviderAdapter } from "./contracts.js";

const defaultMetadataSource = {
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
} as const;

export interface DemoMetadataProviderAdapter extends MetadataProviderAdapter {
  replaceMetadataSource(nextSource: unknown): void;
}

export function createDemoMetadataProvider(
  initialSource: unknown = defaultMetadataSource,
): DemoMetadataProviderAdapter {
  let currentSource: unknown = initialSource;

  return {
    loadMetadataSource() {
      return currentSource;
    },
    replaceMetadataSource(nextSource: unknown) {
      currentSource = nextSource;
    },
  };
}
