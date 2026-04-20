import type { AnyExpressionNode } from "../contracts/index.js";

export function serializeExpression(node: AnyExpressionNode): string {
  if (node.kind === "NumberLiteral") {
    return node.raw;
  }

  return `${serializeExpression(node.left)} + ${serializeExpression(node.right)}`;
}
