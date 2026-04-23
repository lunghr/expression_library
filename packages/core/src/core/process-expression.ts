import { bindExpression } from "../binder/index.js";
import type { ModelCatalog } from "../model-catalog/index.js";
import { parseExpression } from "../parser/index.js";
import { serializeExpression } from "../serializer/index.js";

import type { ProcessExpressionResult } from "./contracts.js";

export function processExpression(
  source: string,
  catalog: ModelCatalog,
): ProcessExpressionResult {
  const parsed = parseExpression(source);
  const binding = bindExpression(parsed.root, catalog);

  return {
    source,
    root: parsed.root,
    boundRoot: binding.root,
    diagnostics: [...parsed.diagnostics, ...binding.diagnostics],
    serialized: parsed.root === null ? null : serializeExpression(parsed.root),
  };
}
