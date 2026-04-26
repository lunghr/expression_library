export type SuggestionKind = "model" | "field" | "operator" | "function";

export interface SuggestionItem {
  readonly kind: SuggestionKind;
  readonly label: string;
}

export interface SuggestionResult {
  readonly items: readonly SuggestionItem[];
}
