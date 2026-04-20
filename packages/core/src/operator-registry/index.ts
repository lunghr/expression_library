export interface OperatorDefinition {
  readonly symbol: string;
  readonly precedence: number;
}

export interface OperatorRegistry {
  readonly operators: readonly OperatorDefinition[];
}
