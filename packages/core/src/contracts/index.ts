export interface SourceSpan {
  readonly start: number;
  readonly end: number;
}

export function createSourceSpan(start: number, end: number): SourceSpan {
  return {start, end};
}

export interface Diagnostic {
  readonly code: string;
  readonly severity: DiagnosticSeverity;
  readonly category: DiagnosticCategory;
  readonly message: string;
  readonly span: SourceSpan;
}

export type DiagnosticSeverity = "error" | "warning" | "info";

export type DiagnosticCategory =
  | "lexical"
  | "syntax"
  | "metadata"
  | "semantic";

export interface ExpressionNode {
  readonly kind:
    | "NumberLiteral"
    | "StringLiteral"
    | "BooleanLiteral"
    | "Identifier"
    | "MemberExpression"
    | "UnaryExpression"
    | "BinaryExpression";
  readonly span: SourceSpan;
}

export type UnaryOperator = "-" | "!";

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "&&"
  | "||";

export interface NumberLiteralNode extends ExpressionNode {
  readonly kind: "NumberLiteral";
  readonly raw: string;
  readonly value: number;
}

export interface StringLiteralNode extends ExpressionNode {
  readonly kind: "StringLiteral";
  readonly raw: string;
  readonly value: string;
}

export interface BooleanLiteralNode extends ExpressionNode {
  readonly kind: "BooleanLiteral";
  readonly value: boolean;
}

export interface IdentifierNode extends ExpressionNode {
  readonly kind: "Identifier";
  readonly name: string;
}

export interface MemberExpressionNode extends ExpressionNode {
  readonly kind: "MemberExpression";
  readonly object: ReferenceExpressionNode;
  readonly member: IdentifierNode;
}

export type ReferenceExpressionNode = IdentifierNode | MemberExpressionNode;

export interface UnaryExpressionNode extends ExpressionNode {
  readonly kind: "UnaryExpression";
  readonly operator: UnaryOperator;
  readonly operatorSpan: SourceSpan;
  readonly operand: AnyExpressionNode;
}

export interface BinaryExpressionNode extends ExpressionNode {
  readonly kind: "BinaryExpression";
  readonly operator: BinaryOperator;
  readonly operatorSpan: SourceSpan;
  readonly left: AnyExpressionNode;
  readonly right: AnyExpressionNode;
}

export type AnyExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | IdentifierNode
  | MemberExpressionNode
  | UnaryExpressionNode
  | BinaryExpressionNode;

export interface ParseResult {
  readonly root: AnyExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
}
