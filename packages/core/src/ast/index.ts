import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BinaryOperator,
  ExpressionNode,
  NumberLiteralNode,
  SourceSpan,
} from "../contracts/index.js";
import { createSourceSpan } from "../contracts/index.js";

export type {
  AnyExpressionNode,
  BinaryExpressionNode,
  ExpressionNode,
  NumberLiteralNode,
};

export function createNumberLiteral(
  raw: string,
  value: number,
  span: SourceSpan,
): NumberLiteralNode {
  return {
    kind: "NumberLiteral",
    raw,
    value,
    span,
  };
}

export function createBinaryExpression(
  left: AnyExpressionNode,
  operator: BinaryOperator,
  operatorSpan: SourceSpan,
  right: AnyExpressionNode,
): BinaryExpressionNode {
  return {
    kind: "BinaryExpression",
    operator,
    operatorSpan,
    left,
    right,
    span: createSourceSpan(left.span.start, right.span.end),
  };
}
