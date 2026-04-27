import {
  getSuggestions,
  processExpressionResult,
  type ModelCatalog,
  type ProcessedExpressionResult,
  type SuggestionResult,
} from "@expression-editor/core";
import { useEffect, useMemo, useState } from "react";

import type { SubmissionResultView } from "./submission-result.js";

export interface EditorStateSnapshot {
  readonly text: string;
  readonly cursor: number;
  readonly result: ProcessedExpressionResult;
  readonly suggestions: SuggestionResult;
  readonly submission: SubmissionResultView | null;
  readonly isSubmitting: boolean;
}

export interface EditorStateController {
  readonly snapshot: EditorStateSnapshot;
  setText(nextText: string): void;
  setCursor(nextCursor: number): void;
  updateText(nextText: string, nextCursor?: number): void;
  submitExpression(): Promise<void>;
}

export interface UseEditorStateOptions {
  readonly catalog: ModelCatalog;
  readonly initialText?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onSubmitExpression?: (value: string) => Promise<SubmissionResultView>;
  readonly metadataVersion?: number;
}

export function useEditorState({
  catalog,
  initialText = "User.age > 18 && User.active",
  value,
  onValueChange,
  onSubmitExpression,
  metadataVersion,
}: UseEditorStateOptions): EditorStateController {
  const [text, setTextState] = useState(value ?? initialText);
  const [cursor, setCursorState] = useState((value ?? initialText).length);
  const [submission, setSubmission] = useState<SubmissionResultView | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    setSubmission(null);
  }, [metadataVersion]);

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

  return {
    snapshot: {
      text,
      cursor,
      result,
      suggestions,
      submission,
      isSubmitting,
    },
    setText,
    setCursor,
    updateText,
    submitExpression,
  };
}
