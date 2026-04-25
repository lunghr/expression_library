import type {
  AnyExpressionNode,
  Diagnostic,
  ParseResult,
  ReferenceExpressionNode,
} from "../contracts/index.js";
import {
  createBinaryExpression,
  createIdentifier,
  createMemberExpression,
  createNumberLiteral,
} from "../ast/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import {
  getBinaryOperatorDefinitionByTokenKind,
  isBinaryOperatorTokenKind,
  type OperatorDefinition,
} from "../operator-registry/index.js";
import { type Token, tokenize } from "../lexer/index.js";

export type { ParseResult };

export function parseExpression(source: string): ParseResult {
  const tokenized = tokenize(source);
  const diagnostics: Diagnostic[] = [...tokenized.diagnostics];
  const parser = new Parser(tokenized.tokens, diagnostics);
  const root = parser.parseBinaryExpression(0);

  if (root !== null && parser.current().kind !== "End") {
    diagnostics.push(
      createDiagnostic(
        "PAR003",
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
  ) {
  }

  public current(): Token {
    this.skipTrivia();
    return this.tokens[this.index] ?? this.tokens[this.tokens.length - 1];
  }

  public parseBinaryExpression(minPrecedence: number): AnyExpressionNode | null {
    let left = this.parsePostfix();

    while (left !== null) {
      const operatorToken = this.current();
      const operator = getBinaryOperatorDefinitionByTokenKind(operatorToken.kind);

      if (operator === null || operator.precedence < minPrecedence) {
        break;
      }

      this.consume();

      const nextMinPrecedence = operator.associativity === "left"
        ? operator.precedence + 1
        : operator.precedence;
      const right = this.parseBinaryExpression(nextMinPrecedence);

      if (right === null) {
        this.diagnostics.push(
          createDiagnostic(
            this.current().kind === "End"
              ? "PAR004"
              : "PAR001",
            this.current().kind === "End"
              ? `Trailing operator "${operatorToken.lexeme}".`
              : `Expected expression after "${operatorToken.lexeme}".`,
            operatorToken.span,
          ),
        );
        return left;
      }

      left = createBinaryExpression(
        left,
        operator.symbol,
        operatorToken.span,
        right,
      );
    }

    return left;
  }

  private parsePostfix(): AnyExpressionNode | null {
    let expression = this.parsePrimary();

    while (expression !== null && this.current().kind === "Dot") {
      const dotToken = this.consume();

      if (!this.isReferenceNode(expression)) {
        this.diagnostics.push(
          createDiagnostic(
            "PAR007",
            'Invalid identifier usage before ".".',
            dotToken.span,
          ),
        );

        if (this.current().kind === "Identifier") {
          this.consume();
        }

        return expression;
      }

      if (this.current().kind !== "Identifier") {
        this.diagnostics.push(
          createDiagnostic(
            "PAR006",
            'Expected identifier after ".".',
            dotToken.span,
          ),
        );
        return expression;
      }

      const memberToken = this.consume();
      expression = createMemberExpression(
        expression,
        createIdentifier(memberToken.lexeme, memberToken.span),
      );
    }

    return expression;
  }

  private parsePrimary(): AnyExpressionNode | null {
    const token = this.current();

    if (token.kind === "Number") {
      this.consume();
      return createNumberLiteral(token.lexeme, Number(token.lexeme), token.span);
    }

    if (token.kind === "Identifier") {
      this.consume();
      return createIdentifier(token.lexeme, token.span);
    }

    if (token.kind === "OpenParen") {
      const openParen = this.consume();
      const expression = this.parseBinaryExpression(0);

      if (expression === null) {
        this.diagnostics.push(
          createDiagnostic(
            "PAR001",
            "Expected an expression after \"(\".",
            openParen.span,
          ),
        );
        return null;
      }

      if (this.current().kind !== "CloseParen") {
        this.diagnostics.push(
          createDiagnostic(
            "PAR002",
            'Expected closing ")" after expression.',
            openParen.span,
          ),
        );
        return expression;
      }

      this.consume();
      return expression;
    }

    if (token.kind === "Dot") {
      this.diagnostics.push(
        createDiagnostic(
          "PAR005",
          'Unexpected "." without a preceding reference.',
          token.span,
        ),
      );
      return null;
    }

    this.diagnostics.push(
      createDiagnostic(
        "PAR000",
        this.isBinaryOperatorToken(token)
          ? `Missing operand before "${token.lexeme}".`
          : "Unexpected token: expected an expression.",
        token.span,
      ),
    );
    return null;
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

  private isBinaryOperatorToken(token: Token): token is Token & { kind: OperatorDefinition["tokenKind"] } {
    return isBinaryOperatorTokenKind(token.kind);
  }

  private isReferenceNode(node: AnyExpressionNode): node is ReferenceExpressionNode {
    return node.kind === "Identifier" || node.kind === "MemberExpression";
  }
}
