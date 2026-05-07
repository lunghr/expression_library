import type {
  ModelCatalog,
  PreviewContext,
  ProcessedExpressionResult,
  RootBindingContext,
} from "@expression-editor/core";
import { useMemo, useState, type CSSProperties } from "react";

import { ExpressionEditor } from "./expression-editor.js";
import type {
  ExecutionResultView,
  SubmissionResultView,
} from "./submission-result.js";

const playgroundStyle = {
  display: "grid",
  gap: "16px",
  maxWidth: "920px",
  fontFamily: "sans-serif",
} satisfies CSSProperties;

const hostPanelStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "10px",
  padding: "12px",
  backgroundColor: "#fcfcfc",
  display: "grid",
  gap: "10px",
} satisfies CSSProperties;

const hostHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
} satisfies CSSProperties;

const hostTitleStyle = {
  fontSize: "13px",
  color: "#111827",
  fontWeight: 600,
} satisfies CSSProperties;

const hostNoteStyle = {
  fontSize: "12px",
  color: "#6b7280",
} satisfies CSSProperties;

const hostGridStyle = {
  display: "grid",
  gap: "8px",
} satisfies CSSProperties;

const hostRowStyle = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: "12px",
  alignItems: "start",
} satisfies CSSProperties;

const hostLabelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase",
} satisfies CSSProperties;

const hostValueStyle = {
  fontSize: "13px",
  color: "#111827",
  wordBreak: "break-word",
} satisfies CSSProperties;

const previewContextStyle = {
  margin: 0,
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  color: "#374151",
  fontSize: "12px",
  lineHeight: "1.5",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
} satisfies CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "8px",
} satisfies CSSProperties;

const actionButtonStyle = {
  padding: "8px 12px",
  border: "1px solid #d0d0d0",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
} satisfies CSSProperties;

const transportPanelStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "10px",
  padding: "12px",
  backgroundColor: "#ffffff",
  display: "grid",
  gap: "6px",
} satisfies CSSProperties;

const transportTitleStyle = {
  fontSize: "13px",
  color: "#111827",
  fontWeight: 600,
} satisfies CSSProperties;

const transportValueStyle = {
  fontSize: "13px",
  color: "#374151",
  wordBreak: "break-word",
} satisfies CSSProperties;

export interface DemoPlaygroundProps {
  readonly catalog: ModelCatalog;
  readonly rootBindings: RootBindingContext;
  readonly previewContext?: PreviewContext;
  readonly onSubmitExpression?: (value: string) => Promise<SubmissionResultView>;
  readonly onRefreshMetadata?: () => Promise<void>;
  readonly isRefreshingMetadata?: boolean;
}

export function DemoPlayground({
  catalog,
  rootBindings,
  previewContext,
  onSubmitExpression,
  onRefreshMetadata,
  isRefreshingMetadata = false,
}: DemoPlaygroundProps) {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<ProcessedExpressionResult | null>(null);
  const [submission, setSubmission] = useState<SubmissionResultView | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewKeysLabel = useMemo(
    () => getPreviewContextKeysLabel(previewContext),
    [previewContext],
  );
  const previewContextText = useMemo(
    () => getPreviewContextText(previewContext),
    [previewContext],
  );

  async function submitExpression(): Promise<void> {
    if (onSubmitExpression === undefined) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextSubmission = await onSubmitExpression(text);
      setSubmission(nextSubmission);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshMetadata(): Promise<void> {
    if (onRefreshMetadata === undefined) {
      return;
    }

    await onRefreshMetadata();
    setSubmission(null);
  }

  return (
    <div data-testid="demo-playground" style={playgroundStyle}>
      <div data-testid="host-integration-panel" style={hostPanelStyle}>
        <div style={hostHeaderStyle}>
          <div style={hostTitleStyle}>Host Integration Example</div>
          <div style={hostNoteStyle}>Demo-only wiring outside the reusable editor.</div>
        </div>
        <div style={hostGridStyle}>
          <div style={hostRowStyle}>
            <div style={hostLabelStyle}>Catalog</div>
            <div style={hostValueStyle}>{catalog.models.map((model) => model.name).join(", ") || "(none)"}</div>
          </div>
          <div style={hostRowStyle}>
            <div style={hostLabelStyle}>Root Bindings</div>
            <div style={hostValueStyle}>{rootBindings.bindings.map((binding) => `${binding.name} -> ${binding.modelName}`).join(", ") || "(none)"}</div>
          </div>
          <div style={hostRowStyle}>
            <div style={hostLabelStyle}>Preview Context</div>
            <div style={hostGridStyle}>
              <div style={hostValueStyle}>{previewKeysLabel}</div>
              <pre data-testid="preview-context-panel" style={previewContextStyle}>
                {previewContextText}
              </pre>
            </div>
          </div>
          <div style={hostRowStyle}>
            <div style={hostLabelStyle}>Analysis Callback</div>
            <div style={hostValueStyle}>{getAnalysisLabel(analysis)}</div>
          </div>
        </div>
      </div>

      <ExpressionEditor
        catalog={catalog}
        onAnalysisChange={setAnalysis}
        onChange={(nextValue) => {
          setText(nextValue);
          setSubmission(null);
        }}
        previewContext={previewContext}
        rootBindings={rootBindings}
        value={text}
      />

      {onSubmitExpression === undefined && onRefreshMetadata === undefined ? null : (
        <div style={actionsStyle}>
          {onSubmitExpression === undefined ? null : (
            <button
              onClick={() => {
                void submitExpression();
              }}
              style={actionButtonStyle}
              type="button"
            >
              {isSubmitting ? "Sending..." : "Send Expression"}
            </button>
          )}
          {onRefreshMetadata === undefined ? null : (
            <button
              onClick={() => {
                void refreshMetadata();
              }}
              style={actionButtonStyle}
              type="button"
            >
              {isRefreshingMetadata ? "Reloading..." : "Reload Metadata"}
            </button>
          )}
        </div>
      )}

      {onSubmitExpression === undefined ? null : (
        <div data-testid="transport-result-panel" style={transportPanelStyle}>
          <div style={transportTitleStyle}>Transport Result</div>
          <div style={transportValueStyle}>{getSubmissionLabel(submission)}</div>
        </div>
      )}
    </div>
  );
}

function getPreviewContextKeysLabel(previewContext: PreviewContext | undefined): string {
  if (previewContext === undefined) {
    return "Not provided.";
  }

  const keys = Object.keys(previewContext);
  return keys.length === 0 ? "(empty)" : keys.join(", ");
}

function getPreviewContextText(previewContext: PreviewContext | undefined): string {
  if (previewContext === undefined) {
    return "Not provided.";
  }

  return JSON.stringify(previewContext, null, 2);
}

function getAnalysisLabel(result: ProcessedExpressionResult | null): string {
  if (result === null) {
    return "Not available.";
  }

  const diagnosticCount = result.diagnostics.length;
  const suffix = diagnosticCount === 1 ? "1 diagnostic" : `${diagnosticCount} diagnostics`;

  return `${result.status}, ${suffix}`;
}

function getSubmissionLabel(submission: SubmissionResultView | null): string {
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

function getExecutionLabel(executionResult: ExecutionResultView): string {
  if ("value" in executionResult) {
    return `Success: ${JSON.stringify(executionResult.value)}`;
  }

  return `Execution error: ${executionResult.message}`;
}
