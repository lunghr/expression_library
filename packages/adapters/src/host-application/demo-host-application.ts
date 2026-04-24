import { processExpressionResult } from "@expression-editor/core";

import { createDemoExpressionTransport } from "../expression-transport/index.js";
import {
  createDemoMetadataProvider,
  loadModelCatalogFromProvider,
} from "../metadata-provider/index.js";
import type {
  HostApplicationAdapter,
  HostApplicationDependencies,
  HostApplicationServices,
} from "./contracts.js";

export function createHostApplicationAdapter(
  dependencies: HostApplicationDependencies,
): HostApplicationAdapter {
  return {
    async initialize(): Promise<HostApplicationServices> {
      const catalog = await loadModelCatalogFromProvider(
        dependencies.metadataProvider,
      );

      return {
        catalog,
        processExpression(source: string) {
          return processExpressionResult(source, catalog);
        },
        async submitExpression(source: string) {
          const result = processExpressionResult(source, catalog);
          return dependencies.expressionTransport.sendExpression(result);
        },
      };
    },
  };
}

export function createDemoHostApplication(): HostApplicationAdapter {
  return createHostApplicationAdapter({
    metadataProvider: createDemoMetadataProvider(),
    expressionTransport: createDemoExpressionTransport(),
  });
}
