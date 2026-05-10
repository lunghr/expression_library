import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(import.meta.dirname, "..", "..", "..");
const coreRoot = join(repoRoot, "packages", "core", "src");
const adaptersRoot = join(repoRoot, "packages", "adapters", "src");

describe("architecture boundaries", () => {
  it("keeps core free from ui and adapters dependencies", () => {
    const files = listSourceFiles(coreRoot);
    const forbiddenImports = collectForbiddenImports(files, [
      "@expression-editor/ui",
      "@expression-editor/adapters",
      "/packages/ui/",
      "/packages/adapters/",
    ]);

    expect(forbiddenImports).toEqual([]);
  });

  it("allows adapters to depend on core but not on ui", () => {
    const files = listSourceFiles(adaptersRoot);
    const forbiddenImports = collectForbiddenImports(files, [
      "@expression-editor/ui",
      "/packages/ui/",
    ]);

    expect(forbiddenImports).toEqual([]);
  });
});

function listSourceFiles(root: string): string[] {
  const entries = readdirSync(root, {withFileTypes: true});
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectForbiddenImports(
  files: readonly string[],
  forbiddenPatterns: readonly string[],
): string[] {
  const matches: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const normalizedContent = content.replaceAll("\\", "/");

    for (const pattern of forbiddenPatterns) {
      if (normalizedContent.includes(pattern)) {
        matches.push(`${relative(repoRoot, file)} -> ${pattern}`);
      }
    }
  }

  return matches;
}
