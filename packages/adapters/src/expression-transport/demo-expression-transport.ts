import type { ProcessedExpressionResult } from "@expression-editor/core";

import type { ExpressionTransportAdapter, ExpressionTransportResponse, } from "./contracts.js";

export interface DemoExpressionTransportAdapter
  extends ExpressionTransportAdapter {
  readonly sentResults: readonly ProcessedExpressionResult[];
}

export function createDemoExpressionTransport(): DemoExpressionTransportAdapter {
  const sentResults: ProcessedExpressionResult[] = [];

  return {
    get sentResults() {
      return sentResults;
    },
    sendExpression(
      result: ProcessedExpressionResult,
    ): ExpressionTransportResponse {
      sentResults.push(result);

      return {
        accepted: true,
        expression: result.expression,
        status: result.status,
      };
    },
  };
}
