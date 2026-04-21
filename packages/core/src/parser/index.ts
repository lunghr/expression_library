import type {
  AnyExpressionNode,
  BinaryOperator,
  Diagnostic,
  ParseResult,
} from "../contracts/index.js";
import { createBinaryExpression, createNumberLiteral } from "../ast/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { tokenize, type Token } from "../lexer/index.js";

export type { ParseResult };

export function parseExpression(source: string): ParseResult {
  const tokenized = tokenize(source);
  const diagnostics: Diagnostic[] = [...tokenized.diagnostics];
  const parser = new Parser(tokenized.tokens, diagnostics);
  const root = parser.parseLogicalOr();

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
  ) {}

  public current(): Token {
    this.skipTrivia();
    return this.tokens[this.index] ?? this.tokens[this.tokens.length - 1];
  }

  public parseLogicalOr(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parseLogicalAnd(),
      ["PipePipe"],
    );
  }

  private parseLogicalAnd(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parseEquality(),
      ["AmpersandAmpersand"],
    );
  }

  private parseEquality(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parseComparison(),
      ["EqualEqual", "BangEqual"],
    );
  }

  private parseComparison(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parseAdditive(),
      ["Less", "LessEqual", "Greater", "GreaterEqual"],
    );
  }

  private parseAdditive(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parseMultiplicative(),
      ["Plus", "Minus"],
    );
  }

  private parseMultiplicative(): AnyExpressionNode | null {
    return this.parseLeftAssociative(
      () => this.parsePrimary(),
      ["Star", "Slash"],
    );
  }

  private parsePrimary(): AnyExpressionNode | null {
    const token = this.current();

    if (token.kind === "Number") {
      this.consume();
      return createNumberLiteral(token.lexeme, Number(token.lexeme), token.span);
    }

    if (token.kind === "OpenParen") {
      const openParen = this.consume();
      const expression = this.parseLogicalOr();

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

  private parseLeftAssociative(
    parseOperand: () => AnyExpressionNode | null,
    operatorKinds: readonly Token["kind"][],
  ): AnyExpressionNode | null {
    let left = parseOperand();

    while (left !== null && operatorKinds.includes(this.current().kind)) {
      const operatorToken = this.consume();
      const right = parseOperand();

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
        this.getBinaryOperator(operatorToken),
        operatorToken.span,
        right,
      );
    }

    return left;
  }

  private getBinaryOperator(token: Token): BinaryOperator {
    switch (token.kind) {
      case "Plus":
      case "Minus":
      case "Star":
      case "Slash":
      case "EqualEqual":
      case "BangEqual":
      case "Less":
      case "LessEqual":
      case "Greater":
      case "GreaterEqual":
      case "AmpersandAmpersand":
      case "PipePipe":
        return token.lexeme as BinaryOperator;
      default:
        throw new Error(`Token ${token.kind} is not a supported binary operator.`);
    }
  }

  private isBinaryOperatorToken(token: Token): boolean {
    return [
      "Plus",
      "Minus",
      "Star",
      "Slash",
      "EqualEqual",
      "BangEqual",
      "Less",
      "LessEqual",
      "Greater",
      "GreaterEqual",
      "AmpersandAmpersand",
      "PipePipe",
    ].includes(token.kind);
  }
}
