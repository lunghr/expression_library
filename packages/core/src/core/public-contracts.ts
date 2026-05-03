import type { BindingResult } from "../binder/index.js";
import type { Diagnostic, ParseResult } from "../contracts/index.js";
import type { PreviewResult } from "../preview/index.js";
import type { RootBindingContext } from "../root-bindings/index.js";
import type {
  JsonExpressionNode,
  SerializedExpression,
} from "../serializer/index.js";
import type { SuggestionResult } from "../suggestions/index.js";

import type { ProcessExpressionResult } from "./contracts.js";
import type { ProcessedExpressionResult } from "./final-result.js";

export type CoreParseResult = ParseResult;
export type CoreBindResult = BindingResult;
export type CoreDiagnostic = Diagnostic;
export type CoreSuggestionResult = SuggestionResult;
export type CorePreviewResult = PreviewResult;
export type CoreProcessResult = ProcessExpressionResult;
export type CoreProcessedExpressionResult = ProcessedExpressionResult;
export type CoreRootBindingContext = RootBindingContext;

export interface CoreSerializationResult extends SerializedExpression {
  readonly text: string;
  readonly json: JsonExpressionNode;
}
