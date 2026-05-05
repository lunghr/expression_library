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

const editorFrameStyle = {
  position: "relative",
} satisfies CSSProperties;

export interface ExpressionEditorProps {
  readonly catalog?: ModelCatalog | null;
  readonly value?: string;
  readonly initialValue?: string;
  readonly onChange?: (value: string) => void;
  readonly rootBindings?: RootBindingContext;
  readonly previewContext?: PreviewContext;
  readonly onAnalysisChange?: (result: ProcessedExpressionResult | null) => void;
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
      <div style={editorFrameStyle}>
        <div style={panelStyle}>
        <div>Expression</div>
        <TextModeRenderer
          text={snapshot.text}
          cursor={snapshot.cursor}
          isSuggestionOpen={snapshot.isSuggestionOpen}
          onTextChange={(nextText, nextCursor) => {
            editorState.updateText(nextText, nextCursor);
          }}
          onCursorChange={(nextCursor) => {
            editorState.setCursor(nextCursor);
          }}
          onSuggestionPrevious={() => {
            editorState.moveActiveSuggestion(-1);
          }}
          onSuggestionNext={() => {
            editorState.moveActiveSuggestion(1);
          }}
          onSuggestionClose={() => {
            editorState.closeSuggestions();
          }}
          onSuggestionAccept={() => {
            editorState.applySuggestion();
          }}
        />
        </div>
        <SuggestionPanel
          activeIndex={snapshot.activeSuggestionIndex}
          isOpen={snapshot.isSuggestionOpen}
          onSelect={(index) => {
            editorState.applySuggestion(index);
          }}
          suggestions={snapshot.suggestions}
        />
      </div>
      {catalog === undefined || catalog === null ? (
        <div style={panelStyle}>Metadata is not ready.</div>
      ) : null}
      <ResultPanel preview={snapshot.preview} result={snapshot.result} />
      <DiagnosticsPanel diagnostics={snapshot.result?.diagnostics ?? []} />
    </div>
  );
}
