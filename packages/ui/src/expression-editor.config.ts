export interface ExpressionEditorConfig {
  readonly placeholder?: string;
  readonly showProblems?: boolean;
  readonly showResult?: boolean;
  readonly enableAutocomplete?: boolean;
}

export const expressionEditorConfig: Required<ExpressionEditorConfig> = {
  placeholder: "",
  showProblems: true,
  showResult: true,
  enableAutocomplete: true,
};
