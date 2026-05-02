import type { BinaryOperator, SourceSpan, UnaryOperator } from "../contracts/index.js";

export type JsonExpressionNode =
  | JsonNumberLiteralNode
  | JsonStringLiteralNode
  | JsonBooleanLiteralNode
  | JsonIdentifierNode
  | JsonMemberNode
  | JsonUnaryExpressionNode
  | JsonBinaryExpressionNode;

export interface JsonExpressionBase {
  readonly type: string;
  readonly span?: SourceSpan;
}

export interface JsonNumberLiteralNode extends JsonExpressionBase {
  readonly type: "number";
  readonly value: number;
  readonly raw: string;
}

export interface JsonStringLiteralNode extends JsonExpressionBase {
  readonly type: "string";
  readonly value: string;
}

export interface JsonBooleanLiteralNode extends JsonExpressionBase {
  readonly type: "boolean";
  readonly value: boolean;
}

export interface JsonIdentifierNode extends JsonExpressionBase {
  readonly type: "identifier";
  readonly name: string;
}

export interface JsonMemberNode extends JsonExpressionBase {
  readonly type: "member";
  readonly path: readonly string[];
}

export interface JsonUnaryExpressionNode extends JsonExpressionBase {
  readonly type: "unary";
  readonly operator: UnaryOperator;
  readonly operand: JsonExpressionNode;
}

export interface JsonBinaryExpressionNode extends JsonExpressionBase {
  readonly type: "binary";
  readonly operator: BinaryOperator;
  readonly left: JsonExpressionNode;
  readonly right: JsonExpressionNode;
}

export interface SerializedExpression {
  readonly text: string;
  readonly json: JsonExpressionNode;
}
