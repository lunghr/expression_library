import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const coreEntry = resolve(currentDirectory, "../core/src/index.ts");

export default defineConfig({
  resolve: {
    alias: {
      "@expression-editor/core": coreEntry,
    },
  },
});
