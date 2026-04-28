import type { SourceSpan } from "../contracts/index.js";

export type SuggestionKind = "model" | "field" | "operator" | "function";

export interface SuggestionItem {
  readonly kind: SuggestionKind;
  readonly label: string;
  readonly insertText: string;
  readonly detail?: string;
  readonly replaceSpan?: SourceSpan;
}

export interface SuggestionResult {
  readonly items: readonly SuggestionItem[];
}
