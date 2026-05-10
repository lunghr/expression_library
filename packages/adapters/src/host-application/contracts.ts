import type {
  ModelCatalog,
  ProcessedExpressionResult,
  RootBindingContext,
} from "@expression-editor/core";

import type {
  ExpressionTransportAdapter,
  ExpressionTransportRequest,
  ExpressionTransportResponse,
} from "../expression-transport/index.js";
import type { MetadataProviderAdapter } from "../metadata-provider/index.js";
import type { ExternalRootBindingSource } from "../root-bindings/index.js";

export interface NotSentExpressionTransportResult {
  readonly status: "not_sent";
  readonly reason: string;
}

export interface SentExpressionTransportResult {
  readonly status: "sent";
  readonly request: ExpressionTransportRequest;
  readonly response: ExpressionTransportResponse;
}

export interface TransportErrorExpressionTransportResult {
  readonly status: "transport_error";
  readonly request: ExpressionTransportRequest;
  readonly message: string;
}

export type SubmitExpressionTransportResult =
  | NotSentExpressionTransportResult
  | SentExpressionTransportResult
  | TransportErrorExpressionTransportResult;

export interface SubmitExpressionResult {
  readonly processed: ProcessedExpressionResult;
  readonly transport: SubmitExpressionTransportResult;
}

export interface HostApplicationServices {
  readonly catalog: ModelCatalog;
  readonly rootBindings: RootBindingContext;
  processExpression(source: string): ProcessedExpressionResult;
  submitExpression(source: string): Promise<SubmitExpressionResult>;
  refreshMetadata(): Promise<ModelCatalog>;
}

export interface HostApplicationAdapter {
  initialize(): Promise<HostApplicationServices>;
}

export interface HostApplicationDependencies {
  readonly metadataProvider: MetadataProviderAdapter;
  readonly expressionTransport: ExpressionTransportAdapter;
  readonly rootBindingSource?: ExternalRootBindingSource;
}
