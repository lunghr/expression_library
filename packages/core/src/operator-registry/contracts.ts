import type { BinaryOperator } from "../contracts/index.js";
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

export interface OperatorRegistry {
  readonly operators: readonly OperatorDefinition[];
}

export type BuiltInFunctionName = "sum" | "avg" | "count";

export type BuiltInFunctionArgumentType =
  | "number"
  | "boolean"
  | "string"
  | "object"
  | "any";

export interface BuiltInFunctionDefinition {
  readonly name: BuiltInFunctionName;
  readonly minArgumentCount: number;
  readonly maxArgumentCount: number;
  readonly argumentTypes: readonly BuiltInFunctionArgumentType[];
  readonly returnType: Exclude<BuiltInFunctionArgumentType, "any">;
}
