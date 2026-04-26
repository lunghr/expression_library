import type { ModelCatalog } from "../model-catalog/index.js";
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
      items: getFieldSuggestions(memberContext.modelName, memberContext.path, catalog),
    };
  }

  const modelPrefix = readIdentifierPrefix(beforeCursor);

  if (modelPrefix !== null) {
    return {
      items: [
        ...catalog.models
          .filter((model) => model.name.startsWith(modelPrefix))
          .map((model) => ({
            kind: "model" as const,
            label: model.name,
          })),
        ...listBuiltInFunctionDefinitions()
          .filter((definition) => definition.name.startsWith(modelPrefix))
          .map((definition) => ({
            kind: "function" as const,
            label: definition.name,
          })),
      ],
    };
  }

  if (shouldSuggestOperators(beforeCursor)) {
    return {
      items: listBinaryOperatorDefinitions().map((operator) => ({
        kind: "operator",
        label: operator.symbol,
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
): SuggestionItem[] {
  if (path.length === 0) {
    const model = catalog.getModel(modelName);
    return model === null
      ? []
      : model.fields.map((field) => ({
        kind: "field",
        label: field.name,
      }));
  }

  const field = catalog.getFieldByPath(modelName, path);

  if (field === null || field.kind !== "object") {
    return [];
  }

  return field.fields.map((childField) => ({
    kind: "field",
    label: childField.name,
  }));
}

function readMemberContext(
  beforeCursor: string,
): { modelName: string; path: readonly string[] } | null {
  const match = beforeCursor.match(/([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\.\s*$/);

  if (!match) {
    return null;
  }

  const segments = match[1]?.split(".") ?? [];

  if (segments.length === 0) {
    return null;
  }

  return {
    modelName: segments[0],
    path: segments.slice(1),
  };
}

function readIdentifierPrefix(beforeCursor: string): string | null {
  if (beforeCursor.trim().length === 0) {
    return "";
  }

  const operatorMatch = beforeCursor.match(/(?:^|[+\-*/<>=!&|(\s])([A-Za-z_][A-Za-z0-9_]*)$/);

  if (!operatorMatch) {
    return null;
  }

  return operatorMatch[1] ?? "";
}

function shouldSuggestOperators(beforeCursor: string): boolean {
  return /([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*|\d+|\))\s*$/.test(beforeCursor);
}
