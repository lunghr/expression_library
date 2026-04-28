import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BinaryOperator,
  BooleanLiteralNode,
  FunctionCallNode,
  IdentifierNode,
  MemberExpressionNode,
  NumberLiteralNode,
  ReferenceExpressionNode,
  SourceSpan,
  StringLiteralNode,
  UnaryExpressionNode,
  UnaryOperator,
} from "../contracts/index.js";
import { createSourceSpan } from "../contracts/index.js";

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

export function createStringLiteral(
  raw: string,
  value: string,
  span: SourceSpan,
): StringLiteralNode {
  return {
    kind: "StringLiteral",
    raw,
    value,
    span,
  };
}

export function createBooleanLiteral(
  value: boolean,
  span: SourceSpan,
): BooleanLiteralNode {
  return {
    kind: "BooleanLiteral",
    value,
    span,
  };
}

export function createIdentifier(
  name: string,
  span: SourceSpan,
): IdentifierNode {
  return {
    kind: "Identifier",
    name,
    span,
  };
}

export function createMemberExpression(
  object: ReferenceExpressionNode,
  member: IdentifierNode,
): MemberExpressionNode {
  return {
    kind: "MemberExpression",
    object,
    member,
    span: createSourceSpan(object.span.start, member.span.end),
  };
}

export function createFunctionCall(
  functionName: IdentifierNode,
  argumentsList: readonly AnyExpressionNode[],
  closingSpan: SourceSpan,
): FunctionCallNode {
  return {
    kind: "FunctionCall",
    functionName,
    arguments: argumentsList,
    span: createSourceSpan(functionName.span.start, closingSpan.end),
  };
}

export function createUnaryExpression(
  operator: UnaryOperator,
  operatorSpan: SourceSpan,
  operand: AnyExpressionNode,
): UnaryExpressionNode {
  return {
    kind: "UnaryExpression",
    operator,
    operatorSpan,
    operand,
    span: createSourceSpan(operatorSpan.start, operand.span.end),
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
