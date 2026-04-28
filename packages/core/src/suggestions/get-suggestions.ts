import type { ModelCatalog } from "../model-catalog/index.js";
import { parseExpression } from "../parser/index.js";
import {
  listBinaryOperatorDefinitions,
  listBuiltInFunctionDefinitions,
} from "../operator-registry/index.js";

import type { SuggestionItem, SuggestionResult } from "./contracts.js";

export function getSuggestions(
  source: string,
  cursor: number,
  catalog: ModelCatalog,
): SuggestionResult {
  const safeCursor = Math.max(0, Math.min(cursor, source.length));
  const beforeCursor = source.slice(0, safeCursor);

  const memberContext = readMemberContext(beforeCursor);

  if (memberContext) {
    return {
      items: getFieldSuggestions(
        memberContext.modelName,
        memberContext.path,
        catalog,
        memberContext.prefix,
        memberContext.replaceStart,
        safeCursor,
      ),
    };
  }

  const functionArgumentContext = readFunctionArgumentContext(beforeCursor);

  if (functionArgumentContext) {
    return {
      items: getModelAndFunctionSuggestions(
        functionArgumentContext.prefix,
        functionArgumentContext.replaceStart,
        safeCursor,
        catalog,
        {includeFunctions: false},
      ),
    };
  }

  const modelPrefix = readIdentifierPrefix(beforeCursor);

  if (modelPrefix !== null) {
    return {
      items: getModelAndFunctionSuggestions(
        modelPrefix.prefix,
        modelPrefix.replaceStart,
        safeCursor,
        catalog,
        {includeFunctions: true},
      ),
    };
  }

  if (shouldSuggestOperators(beforeCursor)) {
    return {
      items: listBinaryOperatorDefinitions().map((operator) => ({
        kind: "operator" as const,
        label: operator.symbol,
        insertText: operator.symbol,
        detail: operator.category,
      })),
    };
  }

  return {
    items: [],
  };
}

function getFieldSuggestions(
  modelName: string,
  path: readonly string[],
  catalog: ModelCatalog,
  prefix: string,
  replaceStart: number,
  cursor: number,
): SuggestionItem[] {
  if (path.length === 0) {
    const model = catalog.getModel(modelName);
    return model === null
      ? []
      : model.fields
        .filter((field) => field.name.startsWith(prefix))
        .map((field) => ({
        kind: "field",
        label: field.name,
        insertText: field.name,
        detail: field.valueType,
        replaceSpan: {start: replaceStart, end: cursor},
      }));
  }

  const field = catalog.getFieldByPath(modelName, path);

  if (field === null || field.kind !== "object") {
    return [];
  }

  return field.fields
    .filter((childField) => childField.name.startsWith(prefix))
    .map((childField) => ({
    kind: "field",
    label: childField.name,
    insertText: childField.name,
    detail: childField.valueType,
    replaceSpan: {start: replaceStart, end: cursor},
  }));
}

function readMemberContext(
  beforeCursor: string,
): { modelName: string; path: readonly string[]; prefix: string; replaceStart: number } | null {
  const match = beforeCursor.match(/([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\.([A-Za-z_][A-Za-z0-9_]*)?$/);

  if (!match) {
    return null;
  }

  const segments = match[1]?.split(".") ?? [];
  const prefix = match[2] ?? "";

  if (segments.length === 0) {
    return null;
  }

  return {
    modelName: segments[0],
    path: segments.slice(1),
    prefix,
    replaceStart: beforeCursor.length - prefix.length,
  };
}

function readIdentifierPrefix(
  beforeCursor: string,
): { prefix: string; replaceStart: number } | null {
  if (beforeCursor.trim().length === 0) {
    return {prefix: "", replaceStart: beforeCursor.length};
  }

  const operatorMatch = beforeCursor.match(/(?:^|[+\-*/<>=!&|(\s])([A-Za-z_][A-Za-z0-9_]*)$/);

  if (!operatorMatch) {
    return null;
  }

  const prefix = operatorMatch[1] ?? "";
  return {
    prefix,
    replaceStart: beforeCursor.length - prefix.length,
  };
}

function readFunctionArgumentContext(
  beforeCursor: string,
): { prefix: string; replaceStart: number } | null {
  const match = beforeCursor.match(/\b[A-Za-z_][A-Za-z0-9_]*\(\s*([A-Za-z_][A-Za-z0-9_]*)?$/);

  if (!match) {
    return null;
  }

  const prefix = match[1] ?? "";
  return {
    prefix,
    replaceStart: beforeCursor.length - prefix.length,
  };
}

function shouldSuggestOperators(beforeCursor: string): boolean {
  const trimmed = beforeCursor.trimEnd();

  if (trimmed.length === 0) {
    return false;
  }

  const parsed = parseExpression(trimmed);

  if (parsed.root === null || parsed.diagnostics.some((diagnostic) => diagnostic.category === "syntax")) {
    return false;
  }

  return true;
}

function getModelAndFunctionSuggestions(
  prefix: string,
  replaceStart: number,
  cursor: number,
  catalog: ModelCatalog,
  options: { readonly includeFunctions: boolean },
): SuggestionItem[] {
  const modelSuggestions = catalog.models
    .filter((model) => model.name.startsWith(prefix))
    .map((model) => ({
      kind: "model" as const,
      label: model.name,
      insertText: model.name,
      detail: "model",
      replaceSpan: {start: replaceStart, end: cursor},
    }));

  if (!options.includeFunctions) {
    return modelSuggestions;
  }

  return [
    ...modelSuggestions,
    ...listBuiltInFunctionDefinitions()
      .filter((definition) => definition.name.startsWith(prefix))
      .map((definition) => ({
        kind: "function" as const,
        label: definition.name,
        insertText: `${definition.name}(`,
        detail: `${definition.name}(...)`,
        replaceSpan: {start: replaceStart, end: cursor},
      })),
  ];
}
