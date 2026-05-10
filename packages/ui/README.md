# @expression-editor/ui

React UI-слой для библиотеки редактора выражений.

Этот пакет содержит переиспользуемую текстовую оболочку редактора, построенную на:

- `@expression-editor/core`
- React
- CodeMirror 6

Внутри есть:

- `ExpressionEditor`
- хук состояния редактора
- UI всплывающего списка подсказок
- UI панели диагностик
- UI панели результата и предварительного просмотра

### Установка

```bash
npm install @expression-editor/ui
```

### Основное использование

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

### Demo app

Явный пример использования библиотеки находится в:

- `apps/demo-playground`

---

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

## Demo app

An explicit library usage example is available in:

- `apps/demo-playground`
