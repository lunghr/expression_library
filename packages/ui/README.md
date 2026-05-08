# @expression-editor/ui

React UI layer for the expression editor library.

This package contains the reusable text-mode editor shell built on top of:

- `@expression-editor/core`
- React
- CodeMirror 6

It includes:

- `ExpressionEditor`
- editor state hook
- suggestion popup UI
- diagnostics panel UI
- result and preview panel UI

## Install

```bash
npm install @expression-editor/ui
```

## Main usage

```tsx
import type { PreviewContext, RootBindingContext } from "@expression-editor/core";
import { ExpressionEditor } from "@expression-editor/ui";

function Example() {
  const catalog = undefined;
  const rootBindings = undefined as RootBindingContext | undefined;
  const previewContext = undefined as PreviewContext | undefined;

  return (
    <ExpressionEditor
      catalog={catalog}
      previewContext={previewContext}
      rootBindings={rootBindings}
      value=""
    />
  );
}
```

## Scope

This package is a UI layer only.

- parsing stays in `@expression-editor/core`
- diagnostics logic stays in `@expression-editor/core`
- semantic logic stays in `@expression-editor/core`
- transport and metadata provider integration stay outside this package

The demo playground is kept in a separate app inside the repository and is not part of the npm package.
