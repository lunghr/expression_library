export type {
  CoreBindResult,
  CoreDiagnostic,
  CoreParseResult,
  CorePreviewResult,
  CoreProcessedExpressionResult,
  CoreProcessResult,
  CoreSerializationResult,
  CoreSuggestionResult,
  ProcessExpressionOptions,
  ProcessExpressionResult,
  ProcessedExpressionResult,
  ProcessedExpressionStatus,
} from "./core/index.js";

export type {
  Diagnostic,
  DiagnosticCategory,
  DiagnosticSeverity,
  ParseResult,
} from "./contracts/index.js";

export type { ModelCatalog } from "./model-catalog/index.js";
export type {
  SuggestionItem,
  SuggestionKind,
  SuggestionResult,
} from "./suggestions/index.js";
export type {
  JsonBinaryExpressionNode,
  JsonBooleanLiteralNode,
  JsonExpressionNode,
  JsonIdentifierNode,
  JsonMemberNode,
  JsonNumberLiteralNode,
  JsonStringLiteralNode,
  JsonUnaryExpressionNode,
  SerializedExpression,
} from "./serializer/index.js";
export type {
  LoadedMetadataDocument,
  MetadataField,
  MetadataIssue,
  MetadataIssueCode,
  MetadataModel,
  MetadataValueKind,
  ProjectMetadataDocument,
  ProjectModelSchema,
  ProjectObjectSchemaNode,
  ProjectReferenceSchemaNode,
  ProjectScalarSchemaNode,
  ProjectScalarSchemaType,
  ProjectSchemaDialect,
  ProjectSchemaNode,
} from "./metadata/index.js";

export { bindExpression } from "./binder/index.js";
export { createDiagnostic } from "./diagnostics/index.js";
export { loadMetadataDocument, MetadataLoadError } from "./metadata/index.js";
export { createModelCatalog, refreshModelCatalog } from "./model-catalog/index.js";
export { parseExpression } from "./parser/index.js";
export { evaluatePreview } from "./preview/index.js";
export { processExpression, processExpressionResult } from "./core/index.js";
export {
  serializeExpression,
  serializeExpressionToJsonAst,
} from "./serializer/index.js";
export { getSuggestions } from "./suggestions/index.js";
