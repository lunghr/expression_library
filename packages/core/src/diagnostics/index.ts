import type { Diagnostic, SourceSpan } from "../contracts/index.js";

export type { Diagnostic };

export function createDiagnostic(
  code: string,
  message: string,
  span: SourceSpan,
): Diagnostic {
  return {
    code,
    message,
    span,
  };
}
