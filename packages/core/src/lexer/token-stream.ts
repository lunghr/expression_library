import type { Token, TokenKind } from "./contracts.js";

export function isTriviaTokenKind(tokenKind: TokenKind): boolean {
  return tokenKind === "Whitespace";
}

export function isSignificantToken(token: Token): boolean {
  return !isTriviaTokenKind(token.kind);
}

export function getSignificantTokens(tokens: readonly Token[]): readonly Token[] {
  return tokens.filter(isSignificantToken);
}
