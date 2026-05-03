import type {
  ModelCatalog,
  PreviewContext,
  RootBindingContext,
} from "@expression-editor/core";
import { useEffect, useState, type CSSProperties } from "react";

import {
  ExpressionEditor,
  type ExpressionEditorProps,
} from "./expression-editor.js";
import type {
  ExecutionResultView,
  SubmissionResultView,
} from "./submission-result.js";

const shellStyle = {
  display: "grid",
  gap: "12px",
  maxWidth: "880px",
  fontFamily: "sans-serif",
} satisfies CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "8px",
} satisfies CSSProperties;

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface EditorShellProps {
  readonly catalog: ModelCatalog;
  readonly initialValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly rootBindings?: RootBindingContext;
  readonly previewContext?: PreviewContext;
  readonly onSubmitExpression?: (value: string) => Promise<SubmissionResultView>;
  readonly onRefreshMetadata?: () => Promise<void>;
  readonly isRefreshingMetadata?: boolean;
}

export function EditorShell({
  catalog,
  initialValue = "User.age > 18 && User.active",
  value,
  onValueChange,
  rootBindings,
  previewContext,
  onSubmitExpression,
  onRefreshMetadata,
  isRefreshingMetadata = false,
}: EditorShellProps) {
  const [localValue, setLocalValue] = useState(value ?? initialValue);
  const [submission, setSubmission] = useState<SubmissionResultView | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setLocalValue(value);
  }, [value]);

  const currentValue = value ?? localValue;

  const editorProps: ExpressionEditorProps = {
    catalog,
    value: currentValue,
    initialValue,
    onChange: (nextValue) => {
      if (value === undefined) {
        setLocalValue(nextValue);
      }

      setSubmission(null);
      onValueChange?.(nextValue);
    },
    rootBindings,
    previewContext,
  };

  async function submitExpression(): Promise<void> {
    if (onSubmitExpression === undefined) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextSubmission = await onSubmitExpression(currentValue);
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
    <div style={shellStyle}>
      <ExpressionEditor {...editorProps} />
      {onSubmitExpression === undefined && onRefreshMetadata === undefined ? null : (
        <div style={actionsStyle}>
          {onSubmitExpression === undefined ? null : (
            <button
              onClick={() => {
                void submitExpression();
              }}
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
              type="button"
            >
              {isRefreshingMetadata ? "Reloading..." : "Reload Metadata"}
            </button>
          )}
        </div>
      )}
      {onSubmitExpression === undefined ? null : (
        <div style={panelStyle}>
          <div>Execution Result</div>
          <div>{getSubmissionLabel(submission)}</div>
        </div>
      )}
    </div>
  );
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
