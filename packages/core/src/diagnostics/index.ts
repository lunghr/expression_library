import type {
  Diagnostic,
  DiagnosticCategory,
  DiagnosticSeverity,
  SourceSpan,
} from "../contracts/index.js";

export type { Diagnostic, DiagnosticCategory, DiagnosticSeverity };

export interface DiagnosticOptions {
  readonly severity?: DiagnosticSeverity;
  readonly category?: DiagnosticCategory;
}

export function createDiagnostic(
  code: string,
  message: string,
  span: SourceSpan,
  options: DiagnosticOptions = {},
): Diagnostic {
  return {
    code,
    severity: options.severity ?? "error",
    category: options.category ?? getDiagnosticCategory(code),
    message,
    span,
  };
}

function getDiagnosticCategory(code: string): DiagnosticCategory {
  if (code.startsWith("LEX")) {
    return "lexical";
  }

  if (code.startsWith("PAR")) {
    return "syntax";
  }

  if (code.startsWith("META")) {
    return "metadata";
  }

  return "semantic";
}
