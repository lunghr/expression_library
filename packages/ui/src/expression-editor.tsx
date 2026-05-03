import type {
  ModelCatalog,
  PreviewContext,
  ProcessedExpressionResult,
  RootBindingContext,
} from "@expression-editor/core";
import type { CSSProperties } from "react";

import { DiagnosticsPanel } from "./diagnostics-panel.js";
import { useEditorState } from "./editor-state.js";
import { ResultPanel } from "./result-panel.js";
import { SuggestionPanel } from "./suggestion-panel.js";
import { TextModeRenderer } from "./text-mode-renderer.js";

const editorStyle = {
  display: "grid",
  gap: "12px",
  maxWidth: "880px",
  fontFamily: "sans-serif",
} satisfies CSSProperties;

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface ExpressionEditorProps {
  readonly catalog: ModelCatalog;
  readonly value?: string;
  readonly initialValue?: string;
  readonly onChange?: (value: string) => void;
  readonly rootBindings?: RootBindingContext;
  readonly previewContext?: PreviewContext;
  readonly onAnalysisChange?: (result: ProcessedExpressionResult) => void;
}

export function ExpressionEditor({
  catalog,
  value,
  initialValue = "User.age > 18 && User.active",
  onChange,
  rootBindings,
  previewContext,
  onAnalysisChange,
}: ExpressionEditorProps) {
  const editorState = useEditorState({
    catalog,
    initialText: initialValue,
    value,
    onValueChange: onChange,
    rootBindings,
    previewContext,
    onAnalysisChange,
  });
  const snapshot = editorState.snapshot;

  return (
    <div style={editorStyle}>
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
      </div>
      <SuggestionPanel suggestions={snapshot.suggestions} />
      <ResultPanel result={snapshot.result} />
      <DiagnosticsPanel diagnostics={snapshot.result.diagnostics} />
    </div>
  );
}
