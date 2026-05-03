export interface RootBinding {
  readonly name: string;
  readonly modelName: string;
}

export interface RootBindingContext {
  readonly bindings: readonly RootBinding[];
}

