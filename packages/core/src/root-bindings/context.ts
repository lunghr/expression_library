import type { ModelCatalog } from "../model-catalog/index.js";

import type { RootBinding, RootBindingContext } from "./contracts.js";

export function createRootBindingContext(
  bindings: readonly RootBinding[],
): RootBindingContext {
  const bindingsByName = new Map<string, RootBinding>();

  for (const binding of bindings) {
    bindingsByName.set(binding.name, binding);
  }

  return {
    bindings: [...bindingsByName.values()],
  };
}

export function createDefaultRootBindingContext(
  catalog: ModelCatalog,
): RootBindingContext {
  return createRootBindingContext(
    catalog.models.map((model) => ({
      name: model.name,
      modelName: model.name,
    })),
  );
}

export function getRootBinding(
  context: RootBindingContext,
  name: string,
): RootBinding | null {
  return context.bindings.find((binding) => binding.name === name) ?? null;
}

