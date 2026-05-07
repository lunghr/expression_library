import {
  EditorState as CodeMirrorState,
  RangeSetBuilder,
  StateEffect,
  StateField,
} from "@codemirror/state";
import type { Diagnostic } from "@expression-editor/core";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  placeholder as codeMirrorPlaceholder,
} from "@codemirror/view";
import { basicSetup } from "codemirror";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

interface TestableEditorHost extends HTMLDivElement {
  __expressionEditorView?: EditorView;
  __expressionEditorTestActions?: {
    previous(): void;
    next(): void;
    close(): void;
    accept(): void;
  };
}

const editorHostStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  overflow: "hidden",
} satisfies CSSProperties;

const setDiagnosticDecorationsEffect = StateEffect.define<DecorationSet>();

const diagnosticDecorationsField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (decorations, transaction) => {
    for (const effect of transaction.effects) {
      if (effect.is(setDiagnosticDecorationsEffect)) {
        return effect.value;
      }
    }

    return decorations.map(transaction.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

export interface TextModeRendererProps {
  readonly text: string;
  readonly cursor: number;
  readonly diagnostics?: readonly Diagnostic[];
  readonly placeholder?: string;
  readonly onTextChange: (value: string, cursor: number) => void;
  readonly onCursorChange: (cursor: number) => void;
  readonly isSuggestionOpen?: boolean;
  readonly onSuggestionPrevious?: () => void;
  readonly onSuggestionNext?: () => void;
  readonly onSuggestionClose?: () => void;
  readonly onSuggestionAccept?: () => void;
}

export function TextModeRenderer({
  text,
  cursor,
  diagnostics = [],
  placeholder = "",
  onTextChange,
  onCursorChange,
  isSuggestionOpen = false,
  onSuggestionPrevious,
  onSuggestionNext,
  onSuggestionClose,
  onSuggestionAccept,
}: TextModeRendererProps) {
  const hostRef = useRef<TestableEditorHost | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isSyncingRef = useRef(false);
  const onTextChangeRef = useRef(onTextChange);
  const onCursorChangeRef = useRef(onCursorChange);
  const isSuggestionOpenRef = useRef(isSuggestionOpen);
  const onSuggestionPreviousRef = useRef(onSuggestionPrevious);
  const onSuggestionNextRef = useRef(onSuggestionNext);
  const onSuggestionCloseRef = useRef(onSuggestionClose);
  const onSuggestionAcceptRef = useRef(onSuggestionAccept);

  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  useEffect(() => {
    onCursorChangeRef.current = onCursorChange;
  }, [onCursorChange]);

  useEffect(() => {
    isSuggestionOpenRef.current = isSuggestionOpen;
  }, [isSuggestionOpen]);

  useEffect(() => {
    onSuggestionPreviousRef.current = onSuggestionPrevious;
  }, [onSuggestionPrevious]);

  useEffect(() => {
    onSuggestionNextRef.current = onSuggestionNext;
  }, [onSuggestionNext]);

  useEffect(() => {
    onSuggestionCloseRef.current = onSuggestionClose;
  }, [onSuggestionClose]);

  useEffect(() => {
    onSuggestionAcceptRef.current = onSuggestionAccept;
  }, [onSuggestionAccept]);

  useEffect(() => {
    const host = hostRef.current;

    if (host === null || viewRef.current !== null) {
      return;
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (isSyncingRef.current) {
        return;
      }

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
          EditorView.domEventHandlers({
            keydown: (event) => {
              if (!isSuggestionOpenRef.current) {
                return false;
              }

              switch (event.key) {
                case "ArrowUp":
                  event.preventDefault();
                  onSuggestionPreviousRef.current?.();
                  return true;
                case "ArrowDown":
                  event.preventDefault();
                  onSuggestionNextRef.current?.();
                  return true;
                case "Escape":
                  event.preventDefault();
                  onSuggestionCloseRef.current?.();
                  return true;
                case "Tab":
                  event.preventDefault();
                  onSuggestionAcceptRef.current?.();
                  return true;
                default:
                  return false;
              }
            },
          }),
          codeMirrorPlaceholder(placeholder),
          diagnosticDecorationsField,
          updateListener,
          EditorView.theme({
            "&": {
              fontSize: "14px",
              backgroundColor: "transparent",
            },
            ".cm-content": {
              fontFamily: "inherit",
              padding: "10px 12px",
              lineHeight: "1.4",
              whiteSpace: "pre",
            },
            ".cm-scroller": {
              fontFamily: "inherit",
              overflowX: "auto",
              overflowY: "hidden",
            },
            ".cm-editor": {
              backgroundColor: "transparent",
            },
            ".cm-gutters": {
              display: "none",
            },
            ".cm-activeLine": {
              backgroundColor: "transparent",
            },
            ".cm-activeLineGutter": {
              backgroundColor: "transparent",
            },
            ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
              backgroundColor: "#cfe3ff",
            },
            "&.cm-focused": {
              outline: "none",
            },
            "&.cm-focused .cm-scroller": {
              boxShadow: "inset 0 0 0 1px #2563eb",
            },
            ".cm-panels": {
              display: "none",
            },
            ".cm-diagnosticUnderline": {
              textDecorationLine: "underline",
              textDecorationStyle: "wavy",
              textDecorationColor: "#dc2626",
              textUnderlineOffset: "3px",
              backgroundColor: "rgba(220, 38, 38, 0.08)",
            },
          }, {dark: false}),
        ],
      }),
      parent: host,
    });

    viewRef.current = view;
    host.__expressionEditorView = view;
    host.__expressionEditorTestActions = {
      previous() {
        onSuggestionPreviousRef.current?.();
      },
      next() {
        onSuggestionNextRef.current?.();
      },
      close() {
        onSuggestionCloseRef.current?.();
      },
      accept() {
        onSuggestionAcceptRef.current?.();
      },
    };

    return () => {
      delete host.__expressionEditorView;
      delete host.__expressionEditorTestActions;
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
    const changes = currentText === text
      ? undefined
      : {from: 0, to: currentText.length, insert: text};
    const selection = currentCursor === selectionAnchor
      ? undefined
      : {anchor: selectionAnchor};

    if (changes === undefined && selection === undefined) {
      return;
    }

    isSyncingRef.current = true;
    view.dispatch({
      changes,
      selection,
    });
    isSyncingRef.current = false;
  }, [cursor, text]);

  useEffect(() => {
    const view = viewRef.current;

    if (view === null) {
      return;
    }

    view.dispatch({
      effects: setDiagnosticDecorationsEffect.of(
        createDiagnosticDecorations(text, diagnostics),
      ),
    });
  }, [diagnostics, text]);

  return <div data-testid="expression-editor" ref={hostRef} style={editorHostStyle}/>;
}

function createDiagnosticDecorations(
  text: string,
  diagnostics: readonly Diagnostic[],
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const sortedDiagnostics = [...diagnostics].sort((left, right) => {
    if (left.span.start !== right.span.start) {
      return left.span.start - right.span.start;
    }

    return left.span.end - right.span.end;
  });

  for (const diagnostic of sortedDiagnostics) {
    const start = Math.max(0, Math.min(diagnostic.span.start, text.length));
    const end = Math.max(start, Math.min(diagnostic.span.end, text.length));

    if (start === end) {
      continue;
    }

    builder.add(
      start,
      end,
      Decoration.mark({class: "cm-diagnosticUnderline"}),
    );
  }

  return builder.finish();
}
