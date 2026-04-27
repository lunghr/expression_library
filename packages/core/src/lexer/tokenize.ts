import type { Diagnostic } from "../contracts/index.js";
import { createSourceSpan } from "../contracts/index.js";
import { createDiagnostic } from "../diagnostics/index.js";

import type { Token, TokenKind, TokenizeResult } from "./contracts.js";

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

    if (isIdentifierStart(character)) {
      const start = index;
      index += 1;

      while (index < source.length && isIdentifierPart(source[index])) {
        index += 1;
      }

      tokens.push({
        kind: "Identifier",
        lexeme: source.slice(start, index),
        span: createSourceSpan(start, index),
      });
      continue;
    }

    const compoundOperator = readCompoundOperator(source, index);

    if (compoundOperator !== null) {
      tokens.push({
        kind: compoundOperator.kind,
        lexeme: compoundOperator.lexeme,
        span: createSourceSpan(index, index + compoundOperator.lexeme.length),
      });
      index += compoundOperator.lexeme.length;
      continue;
    }

    const singleCharacterTokenKind = readSingleCharacterTokenKind(character);

    if (singleCharacterTokenKind !== null) {
      tokens.push({
        kind: singleCharacterTokenKind,
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

function isIdentifierStart(character: string): boolean {
  return (
    (character >= "a" && character <= "z")
    || (character >= "A" && character <= "Z")
    || character === "_"
  );
}

function isIdentifierPart(character: string): boolean {
  return isIdentifierStart(character) || isDigit(character);
}

function readCompoundOperator(
  source: string,
  index: number,
): { kind: TokenKind; lexeme: string } | null {
  const lexeme = source.slice(index, index + 2);

  switch (lexeme) {
    case "==":
      return {kind: "EqualEqual", lexeme};
    case "!=":
      return {kind: "BangEqual", lexeme};
    case "<=":
      return {kind: "LessEqual", lexeme};
    case ">=":
      return {kind: "GreaterEqual", lexeme};
    case "&&":
      return {kind: "AmpersandAmpersand", lexeme};
    case "||":
      return {kind: "PipePipe", lexeme};
    default:
      return null;
  }
}

function readSingleCharacterTokenKind(character: string): TokenKind | null {
  switch (character) {
    case "+":
      return "Plus";
    case "-":
      return "Minus";
    case "*":
      return "Star";
    case "/":
      return "Slash";
    case ".":
      return "Dot";
    case ",":
      return "Comma";
    case "(":
      return "OpenParen";
    case ")":
      return "CloseParen";
    case "<":
      return "Less";
    case ">":
      return "Greater";
    default:
      return null;
  }
}
