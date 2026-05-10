import type {
  OperatorDefinition,
  UnaryOperatorDefinition,
} from "../operator-registry/index.js";

import type { ExpressionValueType } from "./contracts.js";

export interface BinaryOperatorTypeRuleResult {
  readonly resultType: ExpressionValueType;
  readonly isCompatible: boolean;
}

export function getBinaryOperatorTypeRule(
  definition: OperatorDefinition,
  leftType: ExpressionValueType,
  rightType: ExpressionValueType,
): BinaryOperatorTypeRuleResult {
  if (leftType === "unknown" || rightType === "unknown") {
    return {
      resultType: "unknown",
      isCompatible: true,
    };
  }

  switch (definition.category) {
    case "arithmetic":
      return leftType === "number" && rightType === "number"
        ? {resultType: "number", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "comparison":
      return leftType === "number" && rightType === "number"
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "logical":
      return leftType === "boolean" && rightType === "boolean"
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "equality":
      return leftType === rightType && isPrimitiveComparableType(leftType)
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};
  }
}

export function getUnaryOperatorTypeRule(
  definition: UnaryOperatorDefinition,
  operandType: ExpressionValueType,
): BinaryOperatorTypeRuleResult {
  if (operandType === "unknown") {
    return {
      resultType: "unknown",
      isCompatible: true,
    };
  }

  switch (definition.category) {
    case "arithmetic":
      return operandType === "number"
        ? {resultType: "number", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "logical":
      return operandType === "boolean"
        ? {resultType: "boolean", isCompatible: true}
        : {resultType: "unknown", isCompatible: false};

    case "comparison":
    case "equality":
      return {resultType: "unknown", isCompatible: false};
  }
}

function isPrimitiveComparableType(type: ExpressionValueType): boolean {
  return type === "number" || type === "boolean" || type === "string";
}
