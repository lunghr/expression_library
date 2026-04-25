import type { ProcessedExpressionResult } from "@expression-editor/core";
import type { CSSProperties } from "react";

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface ResultPanelProps {
  readonly result: ProcessedExpressionResult;
}

export function ResultPanel({result}: ResultPanelProps) {
  return (
    <>
      <div data-testid="processing-state" style={panelStyle}>
        <div>Processing State</div>
        <div>{getStateLabel(result.status)}</div>
      </div>

      <div data-testid="canonical-output" style={panelStyle}>
        <div>Canonical Output</div>
        <div>{result.expression ?? "(none)"}</div>
      </div>
    </>
  );
}

function getStateLabel(status: string): string {
  switch (status) {
    case "success":
      return "Success";
    case "syntax_error":
      return "Syntax Error";
    case "semantic_error":
      return "Semantic Error";
    default:
      return status;
  }
}
