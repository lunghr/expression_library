import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BooleanLiteralNode,
  Diagnostic,
  IdentifierNode,
  MemberExpressionNode,
  NumberLiteralNode,
  StringLiteralNode,
  UnaryExpressionNode,
} from "../contracts/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import type { ModelCatalog } from "../model-catalog/index.js";
import {
  getBinaryOperatorDefinitionBySymbol,
  getUnaryOperatorDefinitionBySymbol,
} from "../operator-registry/index.js";

import type {
  AnyBoundExpressionNode,
  BindingResult,
  BoundBinaryExpressionNode,
  BoundBooleanLiteralNode,
  BoundIdentifierNode,
  BoundMemberExpressionNode,
  BoundNumberLiteralNode,
  BoundReferenceNode,
  BoundStringLiteralNode,
  BoundUnaryExpressionNode,
  ExpressionValueType,
} from "./contracts.js";
import { getBinaryOperatorTypeRule, getUnaryOperatorTypeRule } from "./type-rules.js";

export function bindExpression(
  root: AnyExpressionNode | null,
  catalog: ModelCatalog,
): BindingResult {
  if (root === null) {
    return {
      root: null,
      diagnostics: [],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const boundRoot = bindNode(root, catalog, diagnostics);

  return {
    root: boundRoot,
    diagnostics,
  };
}

function bindNode(
  node: AnyExpressionNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): AnyBoundExpressionNode {
  switch (node.kind) {
    case "NumberLiteral":
      return bindNumberLiteral(node);
    case "StringLiteral":
      return bindStringLiteral(node);
    case "BooleanLiteral":
      return bindBooleanLiteral(node);
    case "Identifier":
      return bindIdentifier(node, catalog, diagnostics);
    case "MemberExpression":
      return bindMemberExpression(node, catalog, diagnostics);
    case "UnaryExpression":
      return bindUnaryExpression(node, catalog, diagnostics);
    case "BinaryExpression":
      return bindBinaryExpression(node, catalog, diagnostics);
  }
}

function bindNumberLiteral(
  node: NumberLiteralNode,
): BoundNumberLiteralNode {
  return {
    kind: "BoundNumberLiteral",
    source: node,
    span: node.span,
    type: "number",
    value: node.value,
  };
}

function bindIdentifier(
  node: IdentifierNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): BoundIdentifierNode {
  const model = catalog.getModel(node.name);

  if (model === null) {
    diagnostics.push(
      createDiagnostic(
        "SEM001",
        `Unknown identifier "${node.name}".`,
        node.span,
      ),
    );
  }

  return {
    kind: "BoundIdentifier",
    source: node,
    span: node.span,
    name: node.name,
    model,
    type: model === null ? "unknown" : "object",
  };
}

function bindMemberExpression(
  node: MemberExpressionNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): BoundMemberExpressionNode {
  const object = bindReferenceNode(node.object, catalog, diagnostics);
  const memberName = node.member.name;
  const fieldContainer = getMemberFieldContainer(object);

  if (fieldContainer === null) {
    if (object.type === "unknown") {
      return {
        kind: "BoundMemberExpression",
        source: node,
        span: node.span,
        object,
        field: null,
        type: "unknown",
      };
    }

    diagnostics.push(
      createDiagnostic(
        "SEM003",
        `Cannot access field "${memberName}" on a non-object value.`,
        node.member.span,
      ),
    );

    return {
      kind: "BoundMemberExpression",
      source: node,
      span: node.span,
      object,
      field: null,
      type: "unknown",
    };
  }

  const field = object.kind === "BoundIdentifier"
    ? catalog.getField(object.name, memberName)
    : object.field === null
      ? null
      : catalog.getChildField(object.field, memberName);

  if (field === null) {
    diagnostics.push(
      createDiagnostic(
        "SEM002",
        `Unknown field "${memberName}".`,
        node.member.span,
      ),
    );
  }

  return {
    kind: "BoundMemberExpression",
    source: node,
    span: node.span,
    object,
    field,
    type: field === null ? "unknown" : getMetadataFieldType(field),
  };
}

function bindBinaryExpression(
  node: BinaryExpressionNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): BoundBinaryExpressionNode {
  const left = bindNode(node.left, catalog, diagnostics);
  const right = bindNode(node.right, catalog, diagnostics);
  const operatorDefinition = getBinaryOperatorDefinitionBySymbol(node.operator);

  if (operatorDefinition === null) {
    throw new Error(`Unsupported binary operator "${node.operator}".`);
  }

  const rule = getBinaryOperatorTypeRule(operatorDefinition, left.type, right.type);

  if (!rule.isCompatible) {
    diagnostics.push(
      createDiagnostic(
        "SEM004",
        `Operator "${node.operator}" is not compatible with operand types ${left.type} and ${right.type}.`,
        node.operatorSpan,
      ),
    );
  }

  return {
    kind: "BoundBinaryExpression",
    source: node,
    span: node.span,
    operator: node.operator,
    operatorDefinition,
    left,
    right,
    type: rule.resultType,
  };
}

function bindUnaryExpression(
  node: UnaryExpressionNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): BoundUnaryExpressionNode {
  const operand = bindNode(node.operand, catalog, diagnostics);
  const operatorDefinition = getUnaryOperatorDefinitionBySymbol(node.operator);

  if (operatorDefinition === null) {
    throw new Error(`Unsupported unary operator "${node.operator}".`);
  }

  const rule = getUnaryOperatorTypeRule(operatorDefinition, operand.type);

  if (!rule.isCompatible) {
    diagnostics.push(
      createDiagnostic(
        "SEM008",
        `Operator "${node.operator}" is not compatible with operand type ${operand.type}.`,
        node.operatorSpan,
      ),
    );
  }

  return {
    kind: "BoundUnaryExpression",
    source: node,
    span: node.span,
    operator: node.operator,
    operatorDefinition,
    operand,
    type: rule.resultType,
  };
}

function bindStringLiteral(
  node: StringLiteralNode,
): BoundStringLiteralNode {
  return {
    kind: "BoundStringLiteral",
    source: node,
    span: node.span,
    type: "string",
    value: node.value,
  };
}

function bindBooleanLiteral(
  node: BooleanLiteralNode,
): BoundBooleanLiteralNode {
  return {
    kind: "BoundBooleanLiteral",
    source: node,
    span: node.span,
    type: "boolean",
    value: node.value,
  };
}

function bindReferenceNode(
  node: IdentifierNode | MemberExpressionNode,
  catalog: ModelCatalog,
  diagnostics: Diagnostic[],
): BoundReferenceNode {
  if (node.kind === "Identifier") {
    return bindIdentifier(node, catalog, diagnostics);
  }

  return bindMemberExpression(node, catalog, diagnostics);
}

function getMemberFieldContainer(
  object: BoundReferenceNode,
) {
  if (object.kind === "BoundIdentifier") {
    return object.model?.fields ?? null;
  }

  if (object.field?.kind === "object") {
    return object.field.fields;
  }

  return null;
}

function getMetadataFieldType(field: { readonly kind: string; readonly valueType: string }): ExpressionValueType {
  if (field.kind === "object") {
    return "object";
  }

  switch (field.valueType) {
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    default:
      return "unknown";
  }
}
