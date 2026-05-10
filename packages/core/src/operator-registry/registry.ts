import type { BinaryOperator, UnaryOperator } from "../contracts/index.js";
import type { TokenKind } from "../lexer/index.js";

import type {
  OperatorDefinition,
  OperatorRegistry,
  UnaryOperatorDefinition,
} from "./contracts.js";

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

const unaryOperators = [
  {
    symbol: "-",
    tokenKind: "Minus",
    precedence: 70,
    associativity: "right",
    category: "arithmetic",
  },
  {
    symbol: "!",
    tokenKind: "Bang",
    precedence: 70,
    associativity: "right",
    category: "logical",
  },
] as const satisfies readonly UnaryOperatorDefinition[];

const unaryOperatorByTokenKind = new Map<TokenKind, UnaryOperatorDefinition>(
  unaryOperators.map((operator) => [operator.tokenKind, operator]),
);

const unaryOperatorBySymbol = new Map<UnaryOperator, UnaryOperatorDefinition>(
  unaryOperators.map((operator) => [operator.symbol, operator]),
);

export const operatorRegistry: OperatorRegistry = {
  operators: binaryOperators,
  unaryOperators,
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

export function getUnaryOperatorDefinitionByTokenKind(
  tokenKind: TokenKind,
): UnaryOperatorDefinition | null {
  return unaryOperatorByTokenKind.get(tokenKind) ?? null;
}

export function getUnaryOperatorDefinitionBySymbol(
  symbol: UnaryOperator,
): UnaryOperatorDefinition | null {
  return unaryOperatorBySymbol.get(symbol) ?? null;
}

export function isUnaryOperatorTokenKind(tokenKind: TokenKind): boolean {
  return unaryOperatorByTokenKind.has(tokenKind);
}

export function listBinaryOperatorDefinitions(): readonly OperatorDefinition[] {
  return operatorRegistry.operators;
}

export function listUnaryOperatorDefinitions(): readonly UnaryOperatorDefinition[] {
  return operatorRegistry.unaryOperators;
}
