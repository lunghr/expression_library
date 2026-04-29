import type {
  ExpressionTransportAdapter,
  ExpressionTransportRequest,
  ExpressionTransportResponse,
} from "./contracts.js";

export interface DemoExpressionTransportAdapter
  extends ExpressionTransportAdapter {
  readonly sentRequests: readonly ExpressionTransportRequest[];
}

export function createDemoExpressionTransport(): DemoExpressionTransportAdapter {
  const sentRequests: ExpressionTransportRequest[] = [];

  return {
    get sentRequests() {
      return sentRequests;
    },
    sendExpression(
      request: ExpressionTransportRequest,
    ): ExpressionTransportResponse {
      sentRequests.push(request);

      return {
        expression: request.canonicalText,
        executionResult: {
          status: "success",
          value: request.expressionJson,
        },
      };
    },
  };
}
