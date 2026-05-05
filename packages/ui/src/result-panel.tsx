import type {
  PreviewResult,
  ProcessedExpressionResult,
} from "@expression-editor/core";
import type { CSSProperties } from "react";

import type {
  ExecutionResultView,
  SubmissionResultView,
} from "./submission-result.js";

const panelStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "10px",
  backgroundColor: "#fcfcfc",
  overflow: "hidden",
} satisfies CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  color: "#374151",
} satisfies CSSProperties;

const statusStyle = {
  color: "#6b7280",
  fontSize: "12px",
} satisfies CSSProperties;

const bodyStyle = {
  display: "grid",
  gap: "0",
} satisfies CSSProperties;

const rowStyle = {
  display: "grid",
  gap: "4px",
  padding: "10px 12px",
  borderTop: "1px solid #eceff3",
} satisfies CSSProperties;

const firstRowStyle = {
  ...rowStyle,
  borderTop: "none",
} satisfies CSSProperties;

const labelStyle = {
  color: "#6b7280",
  fontSize: "12px",
  textTransform: "uppercase",
} satisfies CSSProperties;

const valueStyle = {
  color: "#111827",
  fontSize: "13px",
  wordBreak: "break-word",
} satisfies CSSProperties;

const mutedValueStyle = {
  ...valueStyle,
  color: "#6b7280",
} satisfies CSSProperties;

export interface ResultPanelProps {
  readonly result: ProcessedExpressionResult | null;
  readonly preview?: PreviewResult | null;
  readonly submission?: SubmissionResultView | null;
}

export function ResultPanel({
  result,
  preview = null,
  submission,
}: ResultPanelProps) {
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div>Preview</div>
        <div style={statusStyle}>{result === null ? "Unavailable" : getStateLabel(result.status)}</div>
      </div>
      <div style={bodyStyle}>
        <div data-testid="processing-state" style={firstRowStyle}>
          <div style={labelStyle}>Processing State</div>
          <div style={result === null ? mutedValueStyle : valueStyle}>
            {result === null ? "Metadata not ready." : getStateLabel(result.status)}
          </div>
        </div>

        <div data-testid="canonical-output" style={rowStyle}>
          <div style={labelStyle}>Canonical Output</div>
          <div style={result?.expression === null || result?.expression === undefined ? mutedValueStyle : valueStyle}>
            {result?.expression ?? "(none)"}
          </div>
        </div>

        <div style={rowStyle}>
          <div style={labelStyle}>Preview Result</div>
          <div style={preview === null ? mutedValueStyle : valueStyle}>{getPreviewLabel(preview)}</div>
        </div>

        {submission === undefined ? null : (
          <div style={rowStyle}>
            <div style={labelStyle}>Execution Result</div>
            <div style={valueStyle}>{getSubmissionLabel(submission)}</div>
          </div>
        )}
      </div>
    </div>
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

function getPreviewLabel(preview: PreviewResult | null): string {
  if (preview === null) {
    return "Not available.";
  }

  switch (preview.status) {
    case "known":
      return JSON.stringify(preview.value);
    case "unknown":
      return "Unknown";
    case "error":
      return `Error: ${preview.message}`;
  }
}
