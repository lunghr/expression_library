import type { BinaryOperator } from "../contracts/index.js";

import type { ExpressionValueType } from "./contracts.js";

export interface BinaryOperatorTypeRuleResult {
  readonly resultType: ExpressionValueType;
  readonly isCompatible: boolean;
}

export function getBinaryOperatorTypeRule(
  operator: BinaryOperator,
  leftType: ExpressionValueType,
  rightType: ExpressionValueType,
): BinaryOperatorTypeRuleResult {
  if (leftType === "unknown" || rightType === "unknown") {
    return {
      resultType: "unknown",
      isCompatible: true,
    };
  }

  switch (operator) {
    case "+":
    case "-":
    case "*":
    case "/":
      return leftType === "number" && rightType === "number"
        ? {resultType: "number", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "<":
    case "<=":
    case ">":
    case ">=":
      return leftType === "number" && rightType === "number"
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "&&":
    case "||":
      return leftType === "boolean" && rightType === "boolean"
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "==":
    case "!=":
      return leftType === rightType && isPrimitiveComparableType(leftType)
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};
  }
}

function isPrimitiveComparableType(type: ExpressionValueType): boolean {
  return type === "number" || type === "boolean" || type === "string";
}
