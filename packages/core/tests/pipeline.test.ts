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

  it("tokenizes operator set", () => {
    const result = tokenize("1 * (2 + 3) >= 4 && 5 != 6 || 7 / 8");

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "Number",
      "Whitespace",
      "Star",
      "Whitespace",
      "OpenParen",
      "Number",
      "Whitespace",
      "Plus",
      "Whitespace",
      "Number",
      "CloseParen",
      "Whitespace",
      "GreaterEqual",
      "Whitespace",
      "Number",
      "Whitespace",
      "AmpersandAmpersand",
      "Whitespace",
      "Number",
      "Whitespace",
      "BangEqual",
      "Whitespace",
      "Number",
      "Whitespace",
      "PipePipe",
      "Whitespace",
      "Number",
      "Whitespace",
      "Slash",
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

  it("parses arithmetic precedence correctly", () => {
    const result = parseExpression("1 + 2 * 3");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.operator : undefined).toBe("+");
    expect(result.root?.kind === "BinaryExpression" ? result.root.right.kind : undefined).toBe("BinaryExpression");
    expect(
      result.root?.kind === "BinaryExpression" && result.root.right.kind === "BinaryExpression"
        ? result.root.right.operator
        : undefined,
    ).toBe("*");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("1 + 2 * 3");
  });

  it("parses parentheses and preserves them during serialization", () => {
    const result = parseExpression("(1 + 2) * 3");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.operator : undefined).toBe("*");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("(1 + 2) * 3");
  });

  it("parses comparison and logical precedence correctly", () => {
    const result = parseExpression("1 + 2 * 3 >= 4 && 5 != 6 || 7 < 8");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.operator : undefined).toBe("||");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("1 + 2 * 3 >= 4 && 5 != 6 || 7 < 8");
  });

  it("keeps subtraction left-associative", () => {
    const result = parseExpression("10 - 3 - 2");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.left.kind : undefined).toBe("BinaryExpression");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("10 - 3 - 2");
  });

  it("reports a trailing operator", () => {
    const result = parseExpression("1 +");

    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000", "PAR004"]);
  });

  it("reports a missing closing parenthesis", () => {
    const result = parseExpression("(1 + 2");

    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR002"]);
  });

  it("reports an unexpected token at expression start", () => {
    const result = parseExpression("&& 1");

    expect(result.root).toBeNull();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000"]);
  });

  it("reports a missing operand after a binary operator", () => {
    const result = parseExpression("1 * )");

    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000", "PAR001", "PAR003"]);
  });
});
