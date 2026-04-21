import type { AnyExpressionNode, BinaryOperator } from "../contracts/index.js";

export function serializeExpression(node: AnyExpressionNode): string {
  return serializeNode(node, 0, "root");
}

function serializeNode(
  node: AnyExpressionNode,
  parentPrecedence: number,
  position: "left" | "right" | "root",
): string {
  if (node.kind === "NumberLiteral") {
    return node.raw;
  }

  const precedence = getOperatorPrecedence(node.operator);
  const left = serializeNode(node.left, precedence, "left");
  const right = serializeNode(node.right, precedence, "right");
  const serialized = `${left} ${node.operator} ${right}`;

  if (precedence < parentPrecedence) {
    return `(${serialized})`;
  }

  if (position === "right" && precedence === parentPrecedence) {
    return `(${serialized})`;
  }

  return serialized;
}

function getOperatorPrecedence(operator: BinaryOperator): number {
  switch (operator) {
    case "||":
      return 1;
    case "&&":
      return 2;
    case "==":
    case "!=":
      return 3;
    case "<":
    case "<=":
    case ">":
    case ">=":
      return 4;
    case "+":
    case "-":
      return 5;
    case "*":
    case "/":
      return 6;
  }
}
