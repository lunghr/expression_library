import type { Token } from "../lexer/index.js";
import {
  getSignificantTokens,
  tokenize,
} from "../lexer/index.js";
import type { ModelCatalog } from "../model-catalog/index.js";
import { listBinaryOperatorDefinitions } from "../operator-registry/index.js";
import { parseExpression } from "../parser/index.js";
import {
  createDefaultRootBindingContext,
  getRootBinding,
  type RootBindingContext,
} from "../root-bindings/index.js";

import type { SuggestionItem, SuggestionResult } from "./contracts.js";

export function getSuggestions(
  source: string,
  cursor: number,
  catalog: ModelCatalog,
  rootBindings?: RootBindingContext,
): SuggestionResult {
  const safeCursor = Math.max(0, Math.min(cursor, source.length));
  const beforeCursor = source.slice(0, safeCursor);
  const bindingContext = rootBindings ?? createDefaultRootBindingContext(catalog);
  const significantTokens = getSignificantTokens(tokenize(beforeCursor).tokens)
    .filter((token) => token.kind !== "End");

  const memberContext = readMemberContext(significantTokens, safeCursor);

  if (memberContext !== null) {
    return {
      items: getFieldSuggestions(
        memberContext.modelName,
        memberContext.path,
        catalog,
        bindingContext,
        memberContext.prefix,
        memberContext.replaceStart,
        safeCursor,
      ),
    };
  }

  const rootPrefixContext = readRootPrefixContext(significantTokens, safeCursor);

  if (rootPrefixContext !== null) {
    return {
      items: getRootSuggestions(
        rootPrefixContext.prefix,
        rootPrefixContext.replaceStart,
        safeCursor,
        catalog,
        bindingContext,
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
  rootName: string,
  path: readonly string[],
  catalog: ModelCatalog,
  rootBindings: RootBindingContext,
  prefix: string,
  replaceStart: number,
  cursor: number,
): SuggestionItem[] {
  const binding = getRootBinding(rootBindings, rootName);
  const modelName = binding?.modelName ?? null;

  if (modelName === null) {
    return [];
  }

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

function getRootSuggestions(
  prefix: string,
  replaceStart: number,
  cursor: number,
  catalog: ModelCatalog,
  rootBindings: RootBindingContext,
): SuggestionItem[] {
  return rootBindings.bindings
    .filter((binding) => binding.name.startsWith(prefix))
    .map((binding) => {
      const model = catalog.getModel(binding.modelName);

      return {
      kind: "model" as const,
      label: binding.name,
      insertText: binding.name,
      detail: model?.name ?? binding.modelName,
      replaceSpan: {start: replaceStart, end: cursor},
      };
    });
}

function readMemberContext(
  tokens: readonly Token[],
  cursor: number,
): { modelName: string; path: readonly string[]; prefix: string; replaceStart: number } | null {
  if (tokens.length < 2) {
    return null;
  }

  let prefix = "";
  let replaceStart = cursor;
  let index = tokens.length - 1;

  if (
    tokens[index]?.kind === "Identifier"
    && tokens[index]?.span.end === cursor
    && tokens[index - 1]?.kind === "Dot"
  ) {
    prefix = tokens[index]?.lexeme ?? "";
    replaceStart = tokens[index]?.span.start ?? cursor;
    index -= 2;
  } else if (tokens[index]?.kind === "Dot" && tokens[index]?.span.end === cursor) {
    index -= 1;
  } else {
    return null;
  }

  const reversedSegments: string[] = [];

  while (index >= 0) {
    const identifierToken = tokens[index];

    if (identifierToken?.kind !== "Identifier") {
      return null;
    }

    reversedSegments.push(identifierToken.lexeme);

    if (index === 0) {
      break;
    }

    if (tokens[index - 1]?.kind !== "Dot") {
      break;
    }

    index -= 2;
  }

  const segments = reversedSegments.reverse();

  if (segments.length === 0) {
    return null;
  }

  return {
    modelName: segments[0] ?? "",
    path: segments.slice(1),
    prefix,
    replaceStart,
  };
}

function readRootPrefixContext(
  tokens: readonly Token[],
  cursor: number,
): { prefix: string; replaceStart: number } | null {
  if (tokens.length === 0) {
    return {prefix: "", replaceStart: cursor};
  }

  const lastToken = tokens[tokens.length - 1];

  if (lastToken?.kind === "Identifier" && lastToken.span.end === cursor) {
    const previousToken = tokens[tokens.length - 2] ?? null;

    if (
      previousToken !== null
      && !isExpressionStartBoundary(previousToken)
    ) {
      return null;
    }

    return {
      prefix: lastToken.lexeme,
      replaceStart: lastToken.span.start,
    };
  }

  if (isExpressionStartBoundary(lastToken)) {
    return {
      prefix: "",
      replaceStart: cursor,
    };
  }

  return null;
}

function isExpressionStartBoundary(token: Token | null): boolean {
  if (token === null) {
    return true;
  }

  return token.kind === "OpenParen"
    || token.kind === "Comma"
    || token.kind === "Plus"
    || token.kind === "Minus"
    || token.kind === "Star"
    || token.kind === "Slash"
    || token.kind === "EqualEqual"
    || token.kind === "BangEqual"
    || token.kind === "Less"
    || token.kind === "LessEqual"
    || token.kind === "Greater"
    || token.kind === "GreaterEqual"
    || token.kind === "AmpersandAmpersand"
    || token.kind === "PipePipe"
    || token.kind === "Bang";
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
