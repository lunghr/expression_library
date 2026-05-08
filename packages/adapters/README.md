# @expression-editor/adapters

Integration adapters for the expression editor library.

This package contains small integration layers around `@expression-editor/core`.

It includes:

- metadata provider adapters
- expression transport adapters
- host application adapter
- root binding normalization helpers

## Install

```bash
npm install @expression-editor/adapters
```

## Main usage

```ts
import {
  createDemoExpressionTransport,
  createDemoMetadataProvider,
  createHostApplicationAdapter,
} from "@expression-editor/adapters";

const hostApplication = createHostApplicationAdapter({
  metadataProvider: createDemoMetadataProvider(),
  expressionTransport: createDemoExpressionTransport(),
  rootBindingSource: {
    buyer: "User",
    seller: "User",
  },
});
```

## Scope

This package is an integration layer only.
Parsing, diagnostics, semantic logic, metadata normalization, and serialization stay in `@expression-editor/core`.
