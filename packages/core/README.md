# @expression-editor/core

Headless core layer for the expression editor library.

This package contains:

- tokenization
- parsing
- tolerant diagnostics
- metadata loading and model catalog
- semantic binding
- canonical text serialization
- JSON AST serialization
- suggestions
- optional preview evaluation

## Install

```bash
npm install @expression-editor/core
```

## Main usage

```ts
import {
  createModelCatalog,
  loadMetadataDocument,
  processExpressionResult,
} from "@expression-editor/core";

const metadataSource = {
  models: [
    {
      name: "User",
      schema: {
        type: "object",
        properties: {
          age: { type: "number" },
        },
      },
    },
  ],
};

const catalog = createModelCatalog(loadMetadataDocument(metadataSource));
const result = processExpressionResult("User.age > 18", catalog);
```

## What this package exports

The package is split into two public entry points:

- `@expression-editor/core`
- `@expression-editor/core/public-api`

Use `public-api` if you want the smaller integration-focused surface.
Use the root entry if you need the wider package surface.

## Main runtime features

- tolerant parsing for incomplete input
- semantic diagnostics with spans
- root binding support
- canonical text output
- JSON AST output
- optional client-side preview
