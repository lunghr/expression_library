import { processExpressionResult } from "@expression-editor/core";

import { createDemoExpressionTransport } from "../expression-transport/index.js";
import {
  createDemoMetadataProvider,
  loadModelCatalogFromProvider,
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
  expression: string,
): ExpressionTransportRequest {
  return {
    source,
    expression,
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
      const catalog = await loadModelCatalogFromProvider(
        dependencies.metadataProvider,
      );

      return {
        catalog,
        processExpression(source: string) {
          return processExpressionResult(source, catalog);
        },
        async submitExpression(source: string) {
          const processed = processExpressionResult(source, catalog);

          if (processed.status !== "success" || processed.expression === null) {
            return createNotSentResult(processed);
          }

          const request = createTransportRequest(
            processed.source,
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
