import type { JsonExpressionNode } from "@expression-editor/core";

export type ExecutionResultValue =
  | null
  | boolean
  | number
  | string
  | JsonExpressionNode
  | readonly ExecutionResultValue[]
  | { readonly [key: string]: ExecutionResultValue };

export interface ExpressionTransportRequest {
  readonly source: string;
  readonly expressionJson: JsonExpressionNode;
  readonly canonicalText: string | null;
}

export interface SuccessfulExecutionResult {
  readonly status: "success";
  readonly value: ExecutionResultValue;
}

export interface FailedExecutionResult {
  readonly status: "error";
  readonly message: string;
}

export type ExpressionExecutionResult =
  | SuccessfulExecutionResult
  | FailedExecutionResult;

export interface ExpressionTransportResponse {
  readonly expression: string | null;
  readonly executionResult: ExpressionExecutionResult;
}

export interface ExpressionTransportAdapter {
  sendExpression(
    request: ExpressionTransportRequest,
  ): Promise<ExpressionTransportResponse> | ExpressionTransportResponse;
}
