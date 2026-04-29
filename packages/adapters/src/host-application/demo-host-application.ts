import { processExpressionResult } from "@expression-editor/core";

import { createDemoExpressionTransport } from "../expression-transport/index.js";
import {
  createDemoMetadataProvider,
  loadModelCatalogFromProvider,
  reloadModelCatalogFromProvider,
} from "../metadata-provider/index.js";
import type { ExpressionTransportRequest } from "../expression-transport/index.js";
import type {
  HostApplicationAdapter,
  HostApplicationDependencies,
  HostApplicationServices,
  SubmitExpressionResult,
} from "./contracts.js";

function createTransportRequest(
  source: string,
  expressionJson: NonNullable<ReturnType<typeof processExpressionResult>["expressionJson"]>,
  canonicalText: string | null,
): ExpressionTransportRequest {
  return {
    source,
    expressionJson,
    canonicalText,
  };
}

function createNotSentResult(
  processed: ReturnType<typeof processExpressionResult>,
): SubmitExpressionResult {
  return {
    processed,
    transport: {
      status: "not_sent",
      reason: "Expression is not ready for transport.",
    },
  };
}

export function createHostApplicationAdapter(
  dependencies: HostApplicationDependencies,
): HostApplicationAdapter {
  return {
    async initialize(): Promise<HostApplicationServices> {
      let currentCatalog = await loadModelCatalogFromProvider(
        dependencies.metadataProvider,
      );

      return {
        get catalog() {
          return currentCatalog;
        },
        processExpression(source: string) {
          return processExpressionResult(source, currentCatalog);
        },
        async submitExpression(source: string) {
          const processed = processExpressionResult(source, currentCatalog);

          if (
            processed.status !== "success"
            || processed.expressionJson === null
          ) {
            return createNotSentResult(processed);
          }

          const request = createTransportRequest(
            processed.source,
            processed.expressionJson,
            processed.expression,
          );

          try {
            const response = await dependencies.expressionTransport.sendExpression(
              request,
            );

            return {
              processed,
              transport: {
                status: "sent",
                request,
                response,
              },
            };
          } catch (cause) {
            const message = cause instanceof Error
              ? cause.message
              : "Expression transport failed.";

            return {
              processed,
              transport: {
                status: "transport_error",
                request,
                message,
              },
            };
          }
        },
        async refreshMetadata() {
          currentCatalog = await reloadModelCatalogFromProvider(
            dependencies.metadataProvider,
          );

          return currentCatalog;
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
