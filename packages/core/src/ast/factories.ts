import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BinaryOperator,
  FunctionCallNode,
  IdentifierNode,
  MemberExpressionNode,
  NumberLiteralNode,
  ReferenceExpressionNode,
  SourceSpan,
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
