import type { AnyBoundExpressionNode } from "../binder/index.js";
import type { AnyExpressionNode, Diagnostic } from "../contracts/index.js";
import type { PreviewContext, PreviewResult } from "../preview/index.js";

export interface ProcessExpressionOptions {
  readonly previewContext?: PreviewContext;
}

export interface ProcessExpressionResult {
  readonly source: string;
  readonly root: AnyExpressionNode | null;
  readonly boundRoot: AnyBoundExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
  readonly serialized: string | null;
  readonly preview: PreviewResult | null;
}
