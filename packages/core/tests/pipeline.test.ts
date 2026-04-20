import { describe, expect, it } from "vitest";

import { parseExpression, serializeExpression } from "../src/index.js";
import { tokenize } from "../src/lexer/index.js";

describe("core expression pipeline", () => {
  it('parses and serializes "1"', () => {
    const result = parseExpression("1");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.root && "value" in result.root ? result.root.value : undefined).toBe(1);
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("1");
  });

  it('parses and serializes "1 + 2"', () => {
    const result = parseExpression("1 + 2");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root && "operator" in result.root ? result.root.operator : undefined).toBe("+");
    expect(result.root?.kind === "BinaryExpression" ? result.root.left.kind : undefined).toBe("NumberLiteral");
    expect(result.root?.kind === "BinaryExpression" ? result.root.right.kind : undefined).toBe("NumberLiteral");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("1 + 2");
  });

  it('parses and serializes "1 + 2 + 3" as left-associative addition', () => {
    const result = parseExpression("1 + 2 + 3");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.left.kind : undefined).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.right.kind : undefined).toBe("NumberLiteral");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("1 + 2 + 3");
  });

  it("tokenizes whitespace explicitly for the handwritten slice", () => {
    const result = tokenize("1 + 2");

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "Number",
      "Whitespace",
      "Plus",
      "Whitespace",
      "Number",
      "End",
    ]);
  });

  it("reports invalid characters as invalid tokens and diagnostics", () => {
    const result = tokenize("1 + a");

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "Number",
      "Whitespace",
      "Plus",
      "Whitespace",
      "Invalid",
      "End",
    ]);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe("LEX001");
    expect(result.diagnostics[0]?.span).toEqual({ start: 4, end: 5 });
  });

  it("reports a parser diagnostic for an incomplete addition", () => {
    const result = parseExpression("1 +");

    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000", "PAR001"]);
  });
});
