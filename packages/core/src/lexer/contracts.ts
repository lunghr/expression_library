import type { Diagnostic, SourceSpan } from "../contracts/index.js";

export type TokenKind =
  | "Number"
  | "String"
  | "Identifier"
  | "Plus"
  | "Minus"
  | "Star"
  | "Slash"
  | "Dot"
  | "Comma"
  | "OpenParen"
  | "CloseParen"
  | "Bang"
  | "EqualEqual"
  | "BangEqual"
  | "Less"
  | "LessEqual"
  | "Greater"
  | "GreaterEqual"
  | "AmpersandAmpersand"
  | "PipePipe"
  | "Whitespace"
  | "Invalid"
  | "End";

export interface Token {
  readonly kind: TokenKind;
  readonly lexeme: string;
  readonly span: SourceSpan;
}

export interface TokenizeResult {
  readonly tokens: readonly Token[];
  readonly diagnostics: readonly Diagnostic[];
}
