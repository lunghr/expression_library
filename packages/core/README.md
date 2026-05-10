# @expression-editor/core


Headless core-слой библиотеки редактора выражений.

Этот пакет содержит:

- токенизацию
- парсинг
- диагностику с толерантностью к ошибкам
- загрузку метаданных и каталог моделей
- семантическую привязку
- каноническую текстовую сериализацию
- JSON AST сериализацию
- подсказки
- предварительную оценку для предпросмотра

### Установка

```bash
npm install @expression-editor/core
```

### Основное использование

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

### Что экспортирует пакет

Пакет разделен на две публичные точки входа:

- `@expression-editor/core`
- `@expression-editor/core/public-api`

Используй `public-api`, если нужен более узкий integration-focused surface.
Используй root entry, если нужен более широкий surface пакета.

### Как использовать exports

Обычно достаточно такого порядка:

1. загрузить metadata document
2. создать model catalog
3. передать expression source в `processExpressionResult(...)`
4. использовать diagnostics, canonical text, JSON AST и optional preview из результата

### Demo app

Явный пример использования библиотеки находится в:

- `apps/demo-playground`

---


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

## How to use exports

In most cases this order is enough:

1. load a metadata document
2. create a model catalog
3. pass the expression source into `processExpressionResult(...)`
4. use diagnostics, canonical text, JSON AST, and optional preview from the result

## Demo app

An explicit library usage example is available in:

- `apps/demo-playground`
