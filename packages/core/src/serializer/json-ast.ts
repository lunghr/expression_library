import type {
  AnyExpressionNode,
  MemberExpressionNode,
  ReferenceExpressionNode,
} from "../contracts/index.js";

import type { JsonExpressionNode } from "./contracts.js";

export function serializeExpressionToJsonAst(
  node: AnyExpressionNode,
): JsonExpressionNode {
  switch (node.kind) {
    case "NumberLiteral":
      return {
        type: "number",
        value: node.value,
        raw: node.raw,
        span: node.span,
      };

    case "StringLiteral":
      return {
        type: "string",
        value: node.value,
        span: node.span,
      };

    case "BooleanLiteral":
      return {
        type: "boolean",
        value: node.value,
        span: node.span,
      };

    case "Identifier":
      return {
        type: "identifier",
        name: node.name,
        span: node.span,
      };

    case "MemberExpression":
      return {
        type: "member",
        path: getMemberPath(node),
        span: node.span,
      };

    case "UnaryExpression":
      return {
        type: "unary",
        operator: node.operator,
        operand: serializeExpressionToJsonAst(node.operand),
        span: node.span,
      };

    case "BinaryExpression":
      return {
        type: "binary",
        operator: node.operator,
        left: serializeExpressionToJsonAst(node.left),
        right: serializeExpressionToJsonAst(node.right),
        span: node.span,
      };
  }
}

function getMemberPath(node: MemberExpressionNode): readonly string[] {
  return [...getReferencePath(node.object), node.member.name];
}

function getReferencePath(node: ReferenceExpressionNode): readonly string[] {
  if (node.kind === "Identifier") {
    return [node.name];
  }

  return getMemberPath(node);
}
