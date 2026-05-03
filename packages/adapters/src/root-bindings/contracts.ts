import {
  createRootBindingContext,
  type RootBinding,
  type RootBindingContext,
} from "@expression-editor/core";

export interface ExternalRootBinding {
  readonly name: string;
  readonly modelName: string;
}

export type ExternalRootBindingSource =
  | readonly ExternalRootBinding[]
  | Readonly<Record<string, string>>;

export function normalizeRootBindingSource(
  source: ExternalRootBindingSource,
): RootBindingContext {
  if (Array.isArray(source)) {
    return createRootBindingContext(
      source.map((binding) => ({
        name: binding.name,
        modelName: binding.modelName,
      })),
    );
  }

  const bindings: RootBinding[] = Object.entries(source).map(([name, modelName]) => ({
    name,
    modelName,
  }));

  return createRootBindingContext(bindings);
}

