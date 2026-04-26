import type {
  AnyBoundExpressionNode,
  BoundBinaryExpressionNode,
  BoundFunctionCallNode,
  BoundIdentifierNode,
  BoundMemberExpressionNode,
  BoundNumberLiteralNode,
} from "../binder/index.js";
import type { PreviewContext, PreviewResult, PreviewValue } from "./contracts.js";

export function evaluatePreview(
  root: AnyBoundExpressionNode | null,
  context: PreviewContext,
): PreviewResult {
  if (root === null) {
    return {
      status: "error",
      message: "Cannot preview an empty expression.",
    };
  }

  return evaluateNode(root, context);
}

function evaluateNode(
  node: AnyBoundExpressionNode,
  context: PreviewContext,
): PreviewResult {
  switch (node.kind) {
    case "BoundNumberLiteral":
      return evaluateNumberLiteral(node);
    case "BoundIdentifier":
      return evaluateIdentifier(node, context);
    case "BoundMemberExpression":
      return evaluateMemberExpression(node, context);
    case "BoundFunctionCall":
      return evaluateFunctionCall(node, context);
    case "BoundBinaryExpression":
      return evaluateBinaryExpression(node, context);
  }
}

function evaluateNumberLiteral(node: BoundNumberLiteralNode): PreviewResult {
  return {
    status: "known",
    value: node.value,
  };
}

function evaluateIdentifier(
  node: BoundIdentifierNode,
  context: PreviewContext,
): PreviewResult {
  if (node.model === null) {
    return {
      status: "error",
      message: `Unknown identifier "${node.name}".`,
    };
  }

  if (!(node.name in context)) {
    return {status: "unknown"};
  }

  return {
    status: "known",
    value: context[node.name] ?? null,
  };
}

function evaluateMemberExpression(
  node: BoundMemberExpressionNode,
  context: PreviewContext,
): PreviewResult {
  if (node.field === null) {
    return {
      status: "error",
      message: `Cannot resolve field "${node.source.member.name}" for preview.`,
    };
  }

  const objectResult = evaluateNode(node.object, context);

  if (objectResult.status !== "known") {
    return objectResult;
  }

  if (!isPreviewObject(objectResult.value)) {
    return {
      status: "error",
      message: `Cannot read field "${node.source.member.name}" from a non-object preview value.`,
    };
  }

  const memberName = node.source.member.name;

  if (!(memberName in objectResult.value)) {
    return {status: "unknown"};
  }

  return {
    status: "known",
    value: objectResult.value[memberName] ?? null,
  };
}

function evaluateFunctionCall(
  node: BoundFunctionCallNode,
  context: PreviewContext,
): PreviewResult {
  if (node.definition === null) {
    return {
      status: "error",
      message: `Unknown function "${node.functionName}".`,
    };
  }

  if (
    node.arguments.length < node.definition.minArgumentCount
    || node.arguments.length > node.definition.maxArgumentCount
  ) {
    return {
      status: "error",
      message: `Function "${node.functionName}" cannot be previewed with ${node.arguments.length} arguments.`,
    };
  }

  const argumentResults = node.arguments.map((argument) => evaluateNode(argument, context));

  for (const argumentResult of argumentResults) {
    if (argumentResult.status === "error") {
      return argumentResult;
    }
  }

  if (argumentResults.some((argumentResult) => argumentResult.status === "unknown")) {
    return {status: "unknown"};
  }

  const knownArguments = argumentResults
    .filter((argumentResult): argumentResult is Extract<PreviewResult, { status: "known" }> => argumentResult.status === "known")
    .map((argumentResult) => argumentResult.value);

  switch (node.definition.name) {
    case "sum":
    case "avg": {
      const value = knownArguments[0];

      if (typeof value !== "number") {
        return {
          status: "error",
          message: `Function "${node.functionName}" requires a numeric preview value.`,
        };
      }

      return {
        status: "known",
        value,
      };
    }

    case "count": {
      const value = knownArguments[0];

      if (Array.isArray(value)) {
        return {
          status: "known",
          value: value.length,
        };
      }

      return {status: "unknown"};
    }
  }
}

function evaluateBinaryExpression(
  node: BoundBinaryExpressionNode,
  context: PreviewContext,
): PreviewResult {
  if (node.operator === "&&" || node.operator === "||") {
    return evaluateLogicalBinaryExpression(node, context);
  }

  const leftResult = evaluateNode(node.left, context);
  const rightResult = evaluateNode(node.right, context);

  if (leftResult.status !== "known") {
    return leftResult;
  }

  if (rightResult.status !== "known") {
    return rightResult;
  }

  const left = leftResult.value;
  const right = rightResult.value;

  switch (node.operator) {
    case "+":
    case "-":
    case "*":
    case "/":
      if (typeof left !== "number" || typeof right !== "number") {
        return {
          status: "error",
          message: `Operator "${node.operator}" requires numeric preview values.`,
        };
      }

      if (node.operator === "/" && right === 0) {
        return {
          status: "error",
          message: "Division by zero cannot be previewed.",
        };
      }

      return {
        status: "known",
        value: evaluateArithmetic(node.operator, left, right),
      };

    case "<":
    case "<=":
    case ">":
    case ">=":
      if (typeof left !== "number" || typeof right !== "number") {
        return {
          status: "error",
          message: `Operator "${node.operator}" requires numeric preview values.`,
        };
      }

      return {
        status: "known",
        value: evaluateComparison(node.operator, left, right),
      };

    case "==":
    case "!=":
      return {
        status: "known",
        value: node.operator === "==" ? left === right : left !== right,
      };
  }
}

function evaluateLogicalBinaryExpression(
  node: BoundBinaryExpressionNode,
  context: PreviewContext,
): PreviewResult {
  const leftResult = evaluateNode(node.left, context);

  if (leftResult.status !== "known") {
    return leftResult;
  }

  if (typeof leftResult.value !== "boolean") {
    return {
      status: "error",
      message: `Operator "${node.operator}" requires boolean preview values.`,
    };
  }

  if (node.operator === "&&" && leftResult.value === false) {
    return {
      status: "known",
      value: false,
    };
  }

  if (node.operator === "||" && leftResult.value === true) {
    return {
      status: "known",
      value: true,
    };
  }

  const rightResult = evaluateNode(node.right, context);

  if (rightResult.status !== "known") {
    return rightResult;
  }

  if (typeof rightResult.value !== "boolean") {
    return {
      status: "error",
      message: `Operator "${node.operator}" requires boolean preview values.`,
    };
  }

  return {
    status: "known",
    value: node.operator === "&&"
      ? leftResult.value && rightResult.value
      : leftResult.value || rightResult.value,
  };
}

function evaluateArithmetic(
  operator: "+" | "-" | "*" | "/",
  left: number,
  right: number,
): number {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
  }
}

function evaluateComparison(
  operator: "<" | "<=" | ">" | ">=",
  left: number,
  right: number,
): boolean {
  switch (operator) {
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
  }
}

function isPreviewObject(value: PreviewValue): value is { readonly [key: string]: PreviewValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
