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
        expression: request.expression,
        executionResult: {
          status: "success",
          value: request.expression,
        },
      };
    },
  };
}
