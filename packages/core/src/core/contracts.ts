import type { AnyBoundExpressionNode } from "../binder/index.js";
import type { AnyExpressionNode, Diagnostic } from "../contracts/index.js";
import type { PreviewContext, PreviewResult } from "../preview/index.js";
import type { RootBindingContext } from "../root-bindings/index.js";
import type { JsonExpressionNode } from "../serializer/index.js";

export interface ProcessExpressionOptions {
  readonly previewContext?: PreviewContext;
  readonly rootBindings?: RootBindingContext;
}

export interface ProcessExpressionResult {
  readonly source: string;
  readonly root: AnyExpressionNode | null;
  readonly boundRoot: AnyBoundExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
  readonly serialized: string | null;
  readonly serializedJson: JsonExpressionNode | null;
  readonly preview: PreviewResult | null;
}
