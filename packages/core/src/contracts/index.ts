export interface SourceSpan {
  readonly start: number;
  readonly end: number;
}

export function createSourceSpan(start: number, end: number): SourceSpan {
  return {start, end};
}

export interface Diagnostic {
  readonly code: string;
  readonly message: string;
  readonly span: SourceSpan;
}

export interface ExpressionNode {
  readonly kind:
    | "NumberLiteral"
    | "Identifier"
    | "MemberExpression"
    | "FunctionCall"
    | "BinaryExpression";
  readonly span: SourceSpan;
}

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

export interface FunctionCallNode extends ExpressionNode {
  readonly kind: "FunctionCall";
  readonly functionName: IdentifierNode;
  readonly arguments: readonly AnyExpressionNode[];
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
  | IdentifierNode
  | MemberExpressionNode
  | FunctionCallNode
  | BinaryExpressionNode;

export interface ParseResult {
  readonly root: AnyExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
}
