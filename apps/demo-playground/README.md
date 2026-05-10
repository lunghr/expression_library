# Demo Playground

## Русский

Это локальное demo application для библиотеки редактора выражений.

Назначение:

- показывать host-side integration example
- держать demo transport и metadata actions вне `@expression-editor/ui`
- поддерживать manual checks и Playwright E2E scenarios

Это приложение не является частью публичного npm library surface.

### Источник пакетов

Это приложение должно использовать опубликованные npm-пакеты, а не локальные workspace links.

Перед запуском установите зависимости внутри `apps/demo-playground`:

```bash
cd apps/demo-playground
npm install
```

---

## English

This app is a local demo application for the expression editor library.

Purpose:

- show a host-side integration example
- keep demo transport and metadata actions outside `@expression-editor/ui`
- support manual checks and Playwright E2E scenarios

It is not part of the public npm library surface.

## Package source

This app should use published npm packages, not local workspace package links.

Before running it, install dependencies inside `apps/demo-playground`:

```bash
cd apps/demo-playground
npm install
```
