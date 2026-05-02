import type {
  AnyExpressionNode,
  Diagnostic,
  IdentifierNode,
  ParseResult,
  ReferenceExpressionNode,
} from "../contracts/index.js";
import {
  createBinaryExpression,
  createBooleanLiteral,
  createIdentifier,
  createMemberExpression,
  createNumberLiteral,
  createStringLiteral,
  createUnaryExpression,
} from "../ast/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import {
  getBinaryOperatorDefinitionByTokenKind,
  getUnaryOperatorDefinitionByTokenKind,
  isBinaryOperatorTokenKind,
  type OperatorDefinition,
} from "../operator-registry/index.js";
import { type Token, tokenize } from "../lexer/index.js";

import { TokenReader } from "./token-reader.js";

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
  private readonly reader: TokenReader;

  public constructor(
    private readonly tokens: readonly Token[],
    private readonly diagnostics: Diagnostic[],
  ) {
    this.reader = new TokenReader(tokens);
  }

  public current(): Token {
    return this.reader.current();
  }

  public parseBinaryExpression(minPrecedence: number): AnyExpressionNode | null {
    let left = this.parseUnary();

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

  private parseUnary(): AnyExpressionNode | null {
    const operatorToken = this.current();
    const operator = getUnaryOperatorDefinitionByTokenKind(operatorToken.kind);

    if (operator === null) {
      return this.parsePostfix();
    }

    this.consume();
    const operand = this.parseUnary();

    if (operand === null) {
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
      return null;
    }

    return createUnaryExpression(operator.symbol, operatorToken.span, operand);
  }

  private parsePostfix(): AnyExpressionNode | null {
    let expression = this.parsePrimary();

    while (expression !== null) {
      if (this.current().kind === "Dot") {
        expression = this.parseMemberAccess(expression);
        continue;
      }

      break;
    }

    return expression;
  }

  private parsePrimary(): AnyExpressionNode | null {
    const token = this.current();

    if (token.kind === "End") {
      return null;
    }

    if (token.kind === "Number") {
      this.consume();
      return createNumberLiteral(token.lexeme, Number(token.lexeme), token.span);
    }

    if (token.kind === "String") {
      this.consume();
      return createStringLiteral(
        token.lexeme,
        readStringValue(token.lexeme),
        token.span,
      );
    }

    if (token.kind === "Identifier") {
      this.consume();

      if (token.lexeme === "true" || token.lexeme === "false") {
        return createBooleanLiteral(token.lexeme === "true", token.span);
      }

      return createIdentifier(token.lexeme, token.span);
    }

    if (token.kind === "OpenParen") {
      return this.parseGroupedExpression();
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

  private parseGroupedExpression(): AnyExpressionNode | null {
    const openParen = this.consume();
    const expression = this.parseBinaryExpression(0);

    if (expression === null) {
      this.diagnostics.push(
        createDiagnostic(
          "PAR001",
          'Expected an expression after "(".',
          openParen.span,
        ),
      );

      if (this.current().kind !== "CloseParen") {
        this.diagnostics.push(
          createDiagnostic(
            "PAR002",
            'Expected closing ")" after expression.',
            this.reader.createSpanFrom(openParen),
          ),
        );
      }

      return null;
    }

    if (this.current().kind !== "CloseParen") {
      this.diagnostics.push(
        createDiagnostic(
          "PAR002",
          'Expected closing ")" after expression.',
          this.reader.createSpanFrom(openParen),
        ),
      );
      return expression;
    }

    this.consume();
    return expression;
  }

  private parseMemberAccess(expression: AnyExpressionNode): AnyExpressionNode {
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
    return createMemberExpression(
      expression,
      createIdentifier(memberToken.lexeme, memberToken.span),
    );
  }

  private consume(): Token {
    return this.reader.consume();
  }

  private isBinaryOperatorToken(token: Token): token is Token & { kind: OperatorDefinition["tokenKind"] } {
    return isBinaryOperatorTokenKind(token.kind);
  }

  private isReferenceNode(node: AnyExpressionNode): node is ReferenceExpressionNode {
    return node.kind === "Identifier" || node.kind === "MemberExpression";
  }
}

function readStringValue(raw: string): string {
  if (raw.length < 2 || !raw.endsWith('"')) {
    return raw.slice(1);
  }

  return raw
    .slice(1, -1)
    .replaceAll('\\"', '"')
    .replaceAll("\\\\", "\\");
}
