import type { AnyExpressionNode, Diagnostic, ParseResult } from "../contracts/index.js";
import { createBinaryExpression, createNumberLiteral } from "../ast/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { tokenize, type Token } from "../lexer/index.js";

export type { ParseResult };

export function parseExpression(source: string): ParseResult {
  const tokenized = tokenize(source);
  const diagnostics: Diagnostic[] = [...tokenized.diagnostics];
  const parser = new Parser(tokenized.tokens, diagnostics);
  const root = parser.parseExpression();

  if (root !== null && parser.current().kind !== "End") {
    diagnostics.push(
      createDiagnostic(
        "PAR002",
        "Unexpected token after expression.",
        parser.current().span,
      ),
    );
  }

  return {
    root,
    diagnostics,
  };
}

class Parser {
  private index = 0;

  public constructor(
    private readonly tokens: readonly Token[],
    private readonly diagnostics: Diagnostic[],
  ) {}

  public current(): Token {
    this.skipTrivia();
    return this.tokens[this.index] ?? this.tokens[this.tokens.length - 1];
  }

  public parseExpression(): AnyExpressionNode | null {
    let left = this.parsePrimary();

    while (left !== null && this.current().kind === "Plus") {
      const operator = this.consume();
      const right = this.parsePrimary();

      if (right === null) {
        this.diagnostics.push(
          createDiagnostic(
            "PAR001",
            'Expected a number literal after "+".',
            operator.span,
          ),
        );
        return left;
      }

      left = createBinaryExpression(left, operator.span, right);
    }

    return left;
  }

  private parsePrimary(): AnyExpressionNode | null {
    const token = this.current();

    if (token.kind !== "Number") {
      this.diagnostics.push(
        createDiagnostic(
          "PAR000",
          "Expected a number literal.",
          token.span,
        ),
      );
      return null;
    }

    this.consume();

    return createNumberLiteral(token.lexeme, Number(token.lexeme), token.span);
  }

  private consume(): Token {
    const token = this.current();
    this.index += 1;
    return token;
  }

  private skipTrivia(): void {
    while (this.tokens[this.index]?.kind === "Whitespace") {
      this.index += 1;
    }
  }
}
