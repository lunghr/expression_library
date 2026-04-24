import type { ProcessedExpressionResult } from "@expression-editor/core";

export interface ExpressionTransportResponse {
  readonly accepted: boolean;
  readonly expression: string | null;
  readonly status: ProcessedExpressionResult["status"];
}

export interface ExpressionTransportAdapter {
  sendExpression(
    result: ProcessedExpressionResult,
  ): Promise<ExpressionTransportResponse> | ExpressionTransportResponse;
}
