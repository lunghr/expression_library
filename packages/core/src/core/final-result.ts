import type { Diagnostic } from "../contracts/index.js";
import type { ModelCatalog } from "../model-catalog/index.js";

import { processExpression } from "./process-expression.js";

export type ProcessedExpressionStatus =
  | "success"
  | "syntax_error"
  | "semantic_error";

export interface ProcessedExpressionResult {
  readonly source: string;
  readonly status: ProcessedExpressionStatus;
  readonly diagnostics: readonly Diagnostic[];
  readonly expression: string | null;
}

export function processExpressionResult(
  source: string,
  catalog: ModelCatalog,
): ProcessedExpressionResult {
  const result = processExpression(source, catalog);

  return {
    source,
    status: getProcessedExpressionStatus(result.diagnostics),
    diagnostics: result.diagnostics,
    expression: result.serialized,
  };
}

function getProcessedExpressionStatus(
  diagnostics: readonly Diagnostic[],
): ProcessedExpressionStatus {
  if (diagnostics.some((diagnostic) => diagnostic.code.startsWith("PAR") || diagnostic.code.startsWith("LEX"))) {
    return "syntax_error";
  }

  if (diagnostics.some((diagnostic) => diagnostic.code.startsWith("SEM"))) {
    return "semantic_error";
  }

  return "success";
}
