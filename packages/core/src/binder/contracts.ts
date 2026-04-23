import type {
  AnyExpressionNode,
  BinaryExpressionNode,
  BinaryOperator,
  IdentifierNode,
  MemberExpressionNode,
  NumberLiteralNode,
  SourceSpan,
} from "../contracts/index.js";
import type { Diagnostic } from "../diagnostics/index.js";
import type { MetadataField, MetadataModel } from "../metadata/index.js";

export type ExpressionValueType =
  | "number"
  | "boolean"
  | "string"
  | "object"
  | "unknown";

export interface BoundExpressionNode {
  readonly kind:
    | "BoundNumberLiteral"
    | "BoundIdentifier"
    | "BoundMemberExpression"
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

export interface BoundBinaryExpressionNode extends BoundExpressionNode {
  readonly kind: "BoundBinaryExpression";
  readonly source: BinaryExpressionNode;
  readonly operator: BinaryOperator;
  readonly left: BoundExpressionNode;
  readonly right: BoundExpressionNode;
}

export type BoundReferenceNode =
  | BoundIdentifierNode
  | BoundMemberExpressionNode;

export type AnyBoundExpressionNode =
  | BoundNumberLiteralNode
  | BoundIdentifierNode
  | BoundMemberExpressionNode
  | BoundBinaryExpressionNode;

export interface BindingResult {
  readonly root: AnyBoundExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
}
