import { bindExpression } from "../binder/index.js";
import type { ModelCatalog } from "../model-catalog/index.js";
import { parseExpression } from "../parser/index.js";
import { evaluatePreview } from "../preview/index.js";
import { createDefaultRootBindingContext } from "../root-bindings/index.js";
import {
  serializeExpression,
  serializeExpressionToJsonAst,
} from "../serializer/index.js";

import type { ProcessExpressionOptions, ProcessExpressionResult } from "./contracts.js";

export function processExpression(
  source: string,
  catalog: ModelCatalog,
  options: ProcessExpressionOptions = {},
): ProcessExpressionResult {
  const parsed = parseExpression(source);
  const rootBindings = options.rootBindings ?? createDefaultRootBindingContext(catalog);
  const binding = bindExpression(parsed.root, catalog, rootBindings);
  const serializedJson = parsed.root === null
    ? null
    : serializeExpressionToJsonAst(parsed.root);
  const preview = options.previewContext === undefined
    ? null
    : evaluatePreview(binding.root, options.previewContext);

  return {
    source,
    root: parsed.root,
    boundRoot: binding.root,
    diagnostics: [...parsed.diagnostics, ...binding.diagnostics],
    serialized: parsed.root === null ? null : serializeExpression(parsed.root),
    serializedJson,
    preview,
  };
}
