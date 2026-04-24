import type { CSSProperties } from "react";
import { useMemo } from "react";

import { createDemoCatalog } from "./demo-catalog.js";
import { DiagnosticsPanel } from "./diagnostics-panel.js";
import { useEditorState } from "./editor-state.js";
import { ResultPanel } from "./result-panel.js";
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
  readonly initialValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
}

export function EditorShell({
  initialValue = "User.age > 18 && User.active",
  value,
  onValueChange,
}: EditorShellProps) {
  const catalog = useMemo(() => createDemoCatalog(), []);
  const editorState = useEditorState({
    catalog,
    initialText: initialValue,
    value,
    onValueChange,
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
      </div>
      <SuggestionPanel suggestions={snapshot.suggestions} />
      <ResultPanel result={snapshot.result} />
      <DiagnosticsPanel diagnostics={snapshot.result.diagnostics} />
    </div>
  );
}
