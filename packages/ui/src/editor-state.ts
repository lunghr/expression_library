import {
  getSuggestions,
  processExpressionResult,
  type SuggestionItem,
  type PreviewResult,
  type ModelCatalog,
  type PreviewContext,
  type ProcessedExpressionResult,
  type RootBindingContext,
  type SuggestionResult,
} from "@expression-editor/core";
import { useEffect, useMemo, useState } from "react";

export interface EditorStateSnapshot {
  readonly text: string;
  readonly cursor: number;
  readonly result: ProcessedExpressionResult | null;
  readonly suggestions: SuggestionResult;
  readonly preview: PreviewResult | null;
  readonly isSuggestionOpen: boolean;
  readonly activeSuggestionIndex: number;
}

export interface EditorStateController {
  readonly snapshot: EditorStateSnapshot;
  setText(nextText: string): void;
  setCursor(nextCursor: number): void;
  updateText(nextText: string, nextCursor?: number): void;
  moveActiveSuggestion(delta: number): void;
  closeSuggestions(): void;
  applySuggestion(index?: number): void;
}

export interface UseEditorStateOptions {
  readonly catalog?: ModelCatalog | null;
  readonly initialText?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly rootBindings?: RootBindingContext;
  readonly previewContext?: PreviewContext;
  readonly onAnalysisChange?: (result: ProcessedExpressionResult | null) => void;
}

const emptySuggestions: SuggestionResult = {
  items: [],
};

export function useEditorState({
  catalog,
  initialText = "User.age > 18 && User.active",
  value,
  onValueChange,
  rootBindings,
  previewContext,
  onAnalysisChange,
}: UseEditorStateOptions): EditorStateController {
  const [text, setTextState] = useState(value ?? initialText);
  const [cursor, setCursorState] = useState((value ?? initialText).length);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setTextState(value);
    setCursorState((currentCursor) => Math.min(currentCursor, value.length));
  }, [value]);

  const result = useMemo(
    () => {
      if (catalog === undefined || catalog === null) {
        return null;
      }

      return processExpressionResult(text, catalog, previewContext, rootBindings);
    },
    [catalog, previewContext, rootBindings, text],
  );
  const suggestions = useMemo(
    () => {
      if (catalog === undefined || catalog === null) {
        return emptySuggestions;
      }

      return getSuggestions(text, cursor, catalog, rootBindings);
    },
    [catalog, cursor, rootBindings, text],
  );

  useEffect(() => {
    onAnalysisChange?.(result);
  }, [onAnalysisChange, result]);

  useEffect(() => {
    if (suggestions.items.length === 0) {
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(0);
      return;
    }

    setIsSuggestionOpen(true);
    setActiveSuggestionIndex((currentIndex) =>
      Math.max(0, Math.min(currentIndex, suggestions.items.length - 1))
    );
  }, [suggestions]);

  function setText(nextText: string): void {
    if (value === undefined) {
      setTextState(nextText);
    }

    setIsSuggestionOpen(true);
    onValueChange?.(nextText);
  }

  function setCursor(nextCursor: number): void {
    setCursorState(Math.max(0, Math.min(nextCursor, text.length)));
    setIsSuggestionOpen(true);
  }

  function updateText(nextText: string, nextCursor = nextText.length): void {
    if (value === undefined) {
      setTextState(nextText);
    }

    setCursorState(Math.max(0, Math.min(nextCursor, nextText.length)));
    setIsSuggestionOpen(true);
    onValueChange?.(nextText);
  }

  function moveActiveSuggestion(delta: number): void {
    if (!isSuggestionOpen || suggestions.items.length === 0) {
      return;
    }

    setActiveSuggestionIndex((currentIndex) => {
      const nextIndex = currentIndex + delta;

      if (nextIndex < 0) {
        return suggestions.items.length - 1;
      }

      if (nextIndex >= suggestions.items.length) {
        return 0;
      }

      return nextIndex;
    });
  }

  function closeSuggestions(): void {
    setIsSuggestionOpen(false);
  }

  function applySuggestion(index = activeSuggestionIndex): void {
    const item = suggestions.items[index];

    if (item === undefined) {
      return;
    }

    const start = item.replaceSpan?.start ?? cursor;
    const end = item.replaceSpan?.end ?? cursor;
    const nextText = text.slice(0, start) + item.insertText + text.slice(end);
    const nextCursor = start + item.insertText.length;

    updateText(nextText, nextCursor);
    setIsSuggestionOpen(false);
  }

  return {
    snapshot: {
      text,
      cursor,
      result,
      suggestions,
      preview: result?.preview ?? null,
      isSuggestionOpen,
      activeSuggestionIndex,
    },
    setText,
    setCursor,
    updateText,
    moveActiveSuggestion,
    closeSuggestions,
    applySuggestion,
  };
}
