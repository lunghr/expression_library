import type { SourceSpan } from "../contracts/index.js";
import { createSourceSpan } from "../contracts/index.js";
import { isTriviaTokenKind, type Token } from "../lexer/index.js";

export class TokenReader {
  private index = 0;

  public constructor(private readonly tokens: readonly Token[]) {
  }

  public current(): Token {
    this.skipTrivia();
    return this.tokens[this.index] ?? this.tokens[this.tokens.length - 1];
  }

  public previous(): Token | null {
    for (let index = this.index - 1; index >= 0; index -= 1) {
      const token = this.tokens[index];

      if (token !== undefined && !isTriviaTokenKind(token.kind)) {
        return token;
      }
    }

    return null;
  }

  public consume(): Token {
    const token = this.current();
    this.index += 1;
    return token;
  }

  public createSpanFrom(token: Token): SourceSpan {
    const currentToken = this.current();

    if (currentToken.span.start <= token.span.start) {
      return token.span;
    }

    return createSourceSpan(token.span.start, currentToken.span.start);
  }

  private skipTrivia(): void {
    while (this.tokens[this.index] !== undefined && isTriviaTokenKind(this.tokens[this.index].kind)) {
      this.index += 1;
    }
  }
}
