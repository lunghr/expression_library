import type { BinaryOperator, UnaryOperator } from "../contracts/index.js";
import type { TokenKind } from "../lexer/index.js";

export type OperatorAssociativity = "left" | "right";

export type OperatorCategory =
  | "arithmetic"
  | "comparison"
  | "equality"
  | "logical";

export interface OperatorDefinition {
  readonly symbol: BinaryOperator;
  readonly tokenKind: TokenKind;
  readonly precedence: number;
  readonly associativity: OperatorAssociativity;
  readonly category: OperatorCategory;
}

export interface UnaryOperatorDefinition {
  readonly symbol: UnaryOperator;
  readonly tokenKind: TokenKind;
  readonly precedence: number;
  readonly associativity: OperatorAssociativity;
  readonly category: OperatorCategory;
}

export interface OperatorRegistry {
  readonly operators: readonly OperatorDefinition[];
  readonly unaryOperators: readonly UnaryOperatorDefinition[];
}
