import type { BinaryOperator } from "../contracts/index.js";
import type { TokenKind } from "../lexer/index.js";

import type { OperatorDefinition, OperatorRegistry } from "./contracts.js";

const binaryOperators = [
  {
    symbol: "+",
    tokenKind: "Plus",
    precedence: 50,
    associativity: "left",
    category: "arithmetic",
  },
  {
    symbol: "-",
    tokenKind: "Minus",
    precedence: 50,
    associativity: "left",
    category: "arithmetic",
  },
  {
    symbol: "*",
    tokenKind: "Star",
    precedence: 60,
    associativity: "left",
    category: "arithmetic",
  },
  {
    symbol: "/",
    tokenKind: "Slash",
    precedence: 60,
    associativity: "left",
    category: "arithmetic",
  },
  {
    symbol: "==",
    tokenKind: "EqualEqual",
    precedence: 30,
    associativity: "left",
    category: "equality",
  },
  {
    symbol: "!=",
    tokenKind: "BangEqual",
    precedence: 30,
    associativity: "left",
    category: "equality",
  },
  {
    symbol: "<",
    tokenKind: "Less",
    precedence: 40,
    associativity: "left",
    category: "comparison",
  },
  {
    symbol: "<=",
    tokenKind: "LessEqual",
    precedence: 40,
    associativity: "left",
    category: "comparison",
  },
  {
    symbol: ">",
    tokenKind: "Greater",
    precedence: 40,
    associativity: "left",
    category: "comparison",
  },
  {
    symbol: ">=",
    tokenKind: "GreaterEqual",
    precedence: 40,
    associativity: "left",
    category: "comparison",
  },
  {
    symbol: "&&",
    tokenKind: "AmpersandAmpersand",
    precedence: 20,
    associativity: "left",
    category: "logical",
  },
  {
    symbol: "||",
    tokenKind: "PipePipe",
    precedence: 10,
    associativity: "left",
    category: "logical",
  },
] as const satisfies readonly OperatorDefinition[];

const operatorByTokenKind = new Map<TokenKind, OperatorDefinition>(
  binaryOperators.map((operator) => [operator.tokenKind, operator]),
);

const operatorBySymbol = new Map<BinaryOperator, OperatorDefinition>(
  binaryOperators.map((operator) => [operator.symbol, operator]),
);

export const operatorRegistry: OperatorRegistry = {
  operators: binaryOperators,
};

export function getBinaryOperatorDefinitionByTokenKind(
  tokenKind: TokenKind,
): OperatorDefinition | null {
  return operatorByTokenKind.get(tokenKind) ?? null;
}

export function getBinaryOperatorDefinitionBySymbol(
  symbol: BinaryOperator,
): OperatorDefinition | null {
  return operatorBySymbol.get(symbol) ?? null;
}

export function isBinaryOperatorTokenKind(tokenKind: TokenKind): boolean {
  return operatorByTokenKind.has(tokenKind);
}

export function listBinaryOperatorDefinitions(): readonly OperatorDefinition[] {
  return operatorRegistry.operators;
}
