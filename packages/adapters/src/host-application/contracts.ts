import type {
  ModelCatalog,
  ProcessedExpressionResult,
} from "@expression-editor/core";

import type {
  ExpressionTransportAdapter,
  ExpressionTransportResponse,
} from "../expression-transport/index.js";
import type { MetadataProviderAdapter } from "../metadata-provider/index.js";

export interface HostApplicationServices {
  readonly catalog: ModelCatalog;
  processExpression(source: string): ProcessedExpressionResult;
  submitExpression(source: string): Promise<ExpressionTransportResponse>;
}

export interface HostApplicationAdapter {
  initialize(): Promise<HostApplicationServices>;
}

export interface HostApplicationDependencies {
  readonly metadataProvider: MetadataProviderAdapter;
  readonly expressionTransport: ExpressionTransportAdapter;
}
