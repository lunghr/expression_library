import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BinaryOperator,
  BooleanLiteralNode,
  FunctionCallNode,
  IdentifierNode,
  MemberExpressionNode,
  NumberLiteralNode,
  SourceSpan,
  StringLiteralNode,
  UnaryExpressionNode,
  UnaryOperator,
} from "../contracts/index.js";
import type { Diagnostic } from "../diagnostics/index.js";
import type { MetadataField, MetadataModel } from "../metadata/index.js";
import type {
  BuiltInFunctionDefinition,
  OperatorDefinition,
  UnaryOperatorDefinition,
} from "../operator-registry/index.js";

export type ExpressionValueType =
  | "number"
  | "boolean"
  | "string"
  | "object"
  | "unknown";

export interface BoundExpressionNode {
  readonly kind:
    | "BoundNumberLiteral"
    | "BoundStringLiteral"
    | "BoundBooleanLiteral"
    | "BoundIdentifier"
    | "BoundMemberExpression"
    | "BoundFunctionCall"
    | "BoundUnaryExpression"
    | "BoundBinaryExpression";
  readonly span: SourceSpan;
  readonly type: ExpressionValueType;
  readonly source: AnyExpressionNode;
}

export interface BoundNumberLiteralNode extends BoundExpressionNode {
  readonly kind: "BoundNumberLiteral";
  readonly source: NumberLiteralNode;
  readonly value: number;
}

export interface BoundIdentifierNode extends BoundExpressionNode {
  readonly kind: "BoundIdentifier";
  readonly source: IdentifierNode;
  readonly name: string;
  readonly model: MetadataModel | null;
}

export interface BoundMemberExpressionNode extends BoundExpressionNode {
  readonly kind: "BoundMemberExpression";
  readonly source: MemberExpressionNode;
  readonly object: BoundReferenceNode;
  readonly field: MetadataField | null;
}

export interface BoundStringLiteralNode extends BoundExpressionNode {
  readonly kind: "BoundStringLiteral";
  readonly source: StringLiteralNode;
  readonly value: string;
}

export interface BoundBooleanLiteralNode extends BoundExpressionNode {
  readonly kind: "BoundBooleanLiteral";
  readonly source: BooleanLiteralNode;
  readonly value: boolean;
}

export interface BoundFunctionCallNode extends BoundExpressionNode {
  readonly kind: "BoundFunctionCall";
  readonly source: FunctionCallNode;
  readonly functionName: string;
  readonly definition: BuiltInFunctionDefinition | null;
  readonly arguments: readonly AnyBoundExpressionNode[];
}

export interface BoundBinaryExpressionNode extends BoundExpressionNode {
  readonly kind: "BoundBinaryExpression";
  readonly source: BinaryExpressionNode;
  readonly operator: BinaryOperator;
  readonly operatorDefinition: OperatorDefinition;
  readonly left: AnyBoundExpressionNode;
  readonly right: AnyBoundExpressionNode;
}

export interface BoundUnaryExpressionNode extends BoundExpressionNode {
  readonly kind: "BoundUnaryExpression";
  readonly source: UnaryExpressionNode;
  readonly operator: UnaryOperator;
  readonly operatorDefinition: UnaryOperatorDefinition;
  readonly operand: AnyBoundExpressionNode;
}

export type BoundReferenceNode =
  | BoundIdentifierNode
  | BoundMemberExpressionNode;

export type AnyBoundExpressionNode =
  | BoundNumberLiteralNode
  | BoundStringLiteralNode
  | BoundBooleanLiteralNode
  | BoundIdentifierNode
  | BoundMemberExpressionNode
  | BoundFunctionCallNode
  | BoundUnaryExpressionNode
  | BoundBinaryExpressionNode;

export interface BindingResult {
  readonly root: AnyBoundExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
}
