import type { ProcessedExpressionResult } from "@expression-editor/core";
import type { CSSProperties } from "react";

import type {
  ExecutionResultView,
  SubmissionResultView,
} from "./submission-result.js";

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface ResultPanelProps {
  readonly result: ProcessedExpressionResult;
  readonly submission?: SubmissionResultView | null;
}

export function ResultPanel({result, submission}: ResultPanelProps) {
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

      {submission === undefined ? null : (
        <div style={panelStyle}>
          <div>Execution Result</div>
          <div>{getSubmissionLabel(submission)}</div>
        </div>
      )}
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

function getSubmissionLabel(
  submission: SubmissionResultView | null,
): string {
  if (submission === null) {
    return "Not submitted.";
  }

  switch (submission.status) {
    case "not_sent":
      return `Not sent: ${submission.reason}`;
    case "transport_error":
      return `Transport error: ${submission.message}`;
    case "sent":
      return getExecutionLabel(submission.executionResult);
  }
}

function getExecutionLabel(
  executionResult: ExecutionResultView,
): string {
  if ("value" in executionResult) {
    return `Success: ${JSON.stringify(executionResult.value)}`;
  }

  return `Execution error: ${executionResult.message}`;
}
