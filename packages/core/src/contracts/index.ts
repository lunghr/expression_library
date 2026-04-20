export interface SourceSpan {
  readonly start: number;
  readonly end: number;
}

export function createSourceSpan(start: number, end: number): SourceSpan {
  return { start, end };
}

export interface Diagnostic {
  readonly code: string;
  readonly message: string;
  readonly span: SourceSpan;
}

export interface ExpressionNode {
  readonly kind: "NumberLiteral" | "BinaryExpression";
  readonly span: SourceSpan;
}

export interface NumberLiteralNode extends ExpressionNode {
  readonly kind: "NumberLiteral";
  readonly raw: string;
  readonly value: number;
}

export interface BinaryExpressionNode extends ExpressionNode {
  readonly kind: "BinaryExpression";
  readonly operator: "+";
  readonly operatorSpan: SourceSpan;
  readonly left: AnyExpressionNode;
  readonly right: AnyExpressionNode;
}

export type AnyExpressionNode = NumberLiteralNode | BinaryExpressionNode;

export interface ParseResult {
  readonly root: AnyExpressionNode | null;
  readonly diagnostics: readonly Diagnostic[];
}
