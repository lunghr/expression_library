import {
  getSuggestions,
  processExpressionResult,
  type ModelCatalog,
  type ProcessedExpressionResult,
  type SuggestionResult,
} from "@expression-editor/core";
import { useEffect, useMemo, useState } from "react";

export interface EditorStateSnapshot {
  readonly text: string;
  readonly cursor: number;
  readonly result: ProcessedExpressionResult;
  readonly suggestions: SuggestionResult;
}

export interface EditorStateController {
  readonly snapshot: EditorStateSnapshot;
  setText(nextText: string): void;
  setCursor(nextCursor: number): void;
  updateText(nextText: string, nextCursor?: number): void;
}

export interface UseEditorStateOptions {
  readonly catalog: ModelCatalog;
  readonly initialText?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
}

export function useEditorState({
  catalog,
  initialText = "User.age > 18 && User.active",
  value,
  onValueChange,
}: UseEditorStateOptions): EditorStateController {
  const [text, setTextState] = useState(value ?? initialText);
  const [cursor, setCursorState] = useState((value ?? initialText).length);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setTextState(value);
    setCursorState((currentCursor) => Math.min(currentCursor, value.length));
  }, [value]);

  const result = useMemo(
    () => processExpressionResult(text, catalog),
    [catalog, text],
  );
  const suggestions = useMemo(
    () => getSuggestions(text, cursor, catalog),
    [catalog, cursor, text],
  );

  function setText(nextText: string): void {
    if (value === undefined) {
      setTextState(nextText);
    }

    onValueChange?.(nextText);
  }

  function setCursor(nextCursor: number): void {
    setCursorState(Math.max(0, Math.min(nextCursor, text.length)));
  }

  function updateText(nextText: string, nextCursor = nextText.length): void {
    if (value === undefined) {
      setTextState(nextText);
    }

    setCursorState(Math.max(0, Math.min(nextCursor, nextText.length)));
    onValueChange?.(nextText);
  }

  return {
    snapshot: {
      text,
      cursor,
      result,
      suggestions,
    },
    setText,
    setCursor,
    updateText,
  };
}
