import type { ModelCatalog } from "@expression-editor/core";
import type { CSSProperties } from "react";

import { DiagnosticsPanel } from "./diagnostics-panel.js";
import { useEditorState } from "./editor-state.js";
import { ResultPanel } from "./result-panel.js";
import type { SubmissionResultView } from "./submission-result.js";
import { SuggestionPanel } from "./suggestion-panel.js";
import { TextModeRenderer } from "./text-mode-renderer.js";

const shellStyle = {
  display: "grid",
  gap: "12px",
  maxWidth: "880px",
  fontFamily: "sans-serif",
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
  readonly onSubmitExpression?: (value: string) => Promise<SubmissionResultView>;
  readonly onRefreshMetadata?: () => Promise<void>;
  readonly isRefreshingMetadata?: boolean;
  readonly metadataVersion?: number;
}

export function EditorShell({
  catalog,
  initialValue = "User.age > 18 && User.active",
  value,
  onValueChange,
  onSubmitExpression,
  onRefreshMetadata,
  isRefreshingMetadata = false,
  metadataVersion = 0,
}: EditorShellProps) {
  const editorState = useEditorState({
    catalog,
    initialText: initialValue,
    value,
    onValueChange,
    onSubmitExpression,
    metadataVersion,
  });
  const snapshot = editorState.snapshot;

  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div>Expression</div>
        <TextModeRenderer
          text={snapshot.text}
          cursor={snapshot.cursor}
          onTextChange={(nextText, nextCursor) => {
            editorState.updateText(nextText, nextCursor);
          }}
          onCursorChange={(nextCursor) => {
            editorState.setCursor(nextCursor);
          }}
        />
        {onSubmitExpression === undefined ? null : (
          <button
            onClick={() => {
              void editorState.submitExpression();
            }}
            type="button"
          >
            {snapshot.isSubmitting ? "Sending..." : "Send Expression"}
          </button>
        )}
        {onRefreshMetadata === undefined ? null : (
          <button
            onClick={() => {
              void onRefreshMetadata();
            }}
            type="button"
          >
            {isRefreshingMetadata ? "Reloading..." : "Reload Metadata"}
          </button>
        )}
      </div>
      <SuggestionPanel suggestions={snapshot.suggestions} />
      <ResultPanel result={snapshot.result} submission={snapshot.submission} />
      <DiagnosticsPanel diagnostics={snapshot.result.diagnostics} />
    </div>
  );
}
