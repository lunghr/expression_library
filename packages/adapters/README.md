# @expression-editor/adapters

Адаптеры интеграции для библиотеки редактора выражений.

Этот пакет содержит небольшие слои интеграции вокруг `@expression-editor/core`.

Внутри есть:

- адаптеры провайдера metadata
- адаптеры транспорта выражений
- адаптер host application
- вспомогательные функции нормализации root bindings

### Установка

```bash
npm install @expression-editor/adapters
```

### Основное использование

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

### Demo app

Явный пример использования библиотеки находится в:

- `apps/demo-playground`

---


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

## Demo app

An explicit library usage example is available in:

- `apps/demo-playground`
