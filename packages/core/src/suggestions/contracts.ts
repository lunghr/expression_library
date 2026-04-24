export type SuggestionKind = "model" | "field" | "operator";

export interface SuggestionItem {
  readonly kind: SuggestionKind;
  readonly label: string;
}

export interface SuggestionResult {
  readonly items: readonly SuggestionItem[];
}
