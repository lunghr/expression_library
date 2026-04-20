import type { Diagnostic, SourceSpan } from "../contracts/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { createSourceSpan } from "../contracts/index.js";

export type TokenKind = "Number" | "Plus" | "Whitespace" | "Invalid" | "End";

export interface Token {
  readonly kind: TokenKind;
  readonly lexeme: string;
  readonly span: SourceSpan;
}

export interface TokenizeResult {
  readonly tokens: readonly Token[];
  readonly diagnostics: readonly Diagnostic[];
}

export function tokenize(source: string): TokenizeResult {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let index = 0;

  while (index < source.length) {
    const character = source[index];

    if (character === " " || character === "\t" || character === "\n" || character === "\r") {
      const start = index;
      index += 1;

      while (index < source.length && isWhitespace(source[index])) {
        index += 1;
      }

      tokens.push({
        kind: "Whitespace",
        lexeme: source.slice(start, index),
        span: createSourceSpan(start, index),
      });
      continue;
    }

    if (isDigit(character)) {
      const start = index;
      index += 1;

      while (index < source.length && isDigit(source[index])) {
        index += 1;
      }

      tokens.push({
        kind: "Number",
        lexeme: source.slice(start, index),
        span: createSourceSpan(start, index),
      });

      continue;
    }

    if (character === "+") {
      tokens.push({
        kind: "Plus",
        lexeme: character,
        span: createSourceSpan(index, index + 1),
      });
      index += 1;
      continue;
    }

    const invalidSpan = createSourceSpan(index, index + 1);
    tokens.push({
      kind: "Invalid",
      lexeme: character,
      span: invalidSpan,
    });
    diagnostics.push(
      createDiagnostic(
        "LEX001",
        `Unexpected character "${character}".`,
        invalidSpan,
      ),
    );
    index += 1;
  }

  tokens.push({
    kind: "End",
    lexeme: "",
    span: createSourceSpan(source.length, source.length),
  });

  return {
    tokens,
    diagnostics,
  };
}

function isDigit(character: string): boolean {
  return character >= "0" && character <= "9";
}

function isWhitespace(character: string): boolean {
  return character === " " || character === "\t" || character === "\n" || character === "\r";
}
