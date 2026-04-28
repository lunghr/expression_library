import type { AnyExpressionNode } from "../contracts/index.js";
import {
  getBinaryOperatorDefinitionBySymbol,
  getUnaryOperatorDefinitionBySymbol,
} from "../operator-registry/index.js";

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

  if (node.kind === "StringLiteral") {
    return `"${escapeStringValue(node.value)}"`;
  }

  if (node.kind === "BooleanLiteral") {
    return node.value ? "true" : "false";
  }

  if (node.kind === "Identifier") {
    return node.name;
  }

  if (node.kind === "MemberExpression") {
    return `${serializeReference(node.object)}.${node.member.name}`;
  }

  if (node.kind === "FunctionCall") {
    const argumentsList = node.arguments
      .map((argument) => serializeNode(argument, 0, "root"))
      .join(", ");
    return `${node.functionName.name}(${argumentsList})`;
  }

  if (node.kind === "UnaryExpression") {
    const definition = getUnaryOperatorDefinitionBySymbol(node.operator);

    if (definition === null) {
      throw new Error(`Unsupported unary operator "${node.operator}".`);
    }

    const operand = serializeNode(node.operand, definition.precedence, "right");
    return `${node.operator}${operand}`;
  }

  const definition = getBinaryOperatorDefinitionBySymbol(node.operator);

  if (definition === null) {
    throw new Error(`Unsupported binary operator "${node.operator}".`);
  }

  const precedence = definition.precedence;
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

function escapeStringValue(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
}

function serializeReference(node: AnyExpressionNode): string {
  if (node.kind === "Identifier") {
    return node.name;
  }

  if (node.kind === "MemberExpression") {
    return `${serializeReference(node.object)}.${node.member.name}`;
  }

  return `(${serializeNode(node, 0, "root")})`;
}
