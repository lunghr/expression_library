import { EditorState as CodeMirrorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const editorHostStyle = {
  border: "1px solid #d0d0d0",
} satisfies CSSProperties;

export interface TextModeRendererProps {
  readonly text: string;
  readonly cursor: number;
  readonly onTextChange: (value: string, cursor: number) => void;
  readonly onCursorChange: (cursor: number) => void;
}

export function TextModeRenderer({text, cursor, onTextChange, onCursorChange}: TextModeRendererProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onTextChangeRef = useRef(onTextChange);
  const onCursorChangeRef = useRef(onCursorChange);

  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  useEffect(() => {
    onCursorChangeRef.current = onCursorChange;
  }, [onCursorChange]);

  useEffect(() => {
    const host = hostRef.current;

    if (host === null || viewRef.current !== null) {
      return;
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged && !update.selectionSet) {
        return;
      }

      const nextText = update.state.doc.toString();
      const nextCursor = update.state.selection.main.head;

      if (update.docChanged) {
        onTextChangeRef.current(nextText, nextCursor);
        return;
      }
      onCursorChangeRef.current(nextCursor);
    });

    const view = new EditorView({
      state: CodeMirrorState.create({
        doc: text,
        extensions: [
          basicSetup,
          keymap.of([]),
          EditorView.lineWrapping,
          updateListener,
          EditorView.theme({
            "&": {
              minHeight: "140px",
              fontSize: "14px",
            },
            ".cm-content": {
              fontFamily: "monospace",
              padding: "8px",
            },
            ".cm-scroller": {
              fontFamily: "monospace",
            },
            ".cm-focused": {
              outline: "none",
            },
          }),
        ],
      }),
      parent: host,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null) {
      return;
    }
    const currentText = view.state.doc.toString();
    const currentCursor = view.state.selection.main.head;
    if (currentText === text && currentCursor === cursor) {
      return;
    }

    const selectionAnchor = Math.max(0, Math.min(cursor, text.length));

    view.dispatch({
      changes: currentText === text
        ? undefined
        : {from: 0, to: currentText.length, insert: text},
      selection: {anchor: selectionAnchor},
    });
  }, [cursor, text]);

  return <div data-testid="expression-editor" ref={hostRef} style={editorHostStyle}/>;
}
