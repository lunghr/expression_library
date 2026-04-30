import { describe, expect, it } from "vitest";

import { parseExpression } from "../src/index.js";

describe("live editing parser behavior", () => {
  it("keeps empty input quiet during typing", () => {
    const emptyResult = parseExpression("");
    const whitespaceResult = parseExpression("   ");

    expect(emptyResult.root).toBeNull();
    expect(emptyResult.diagnostics).toHaveLength(0);

    expect(whitespaceResult.root).toBeNull();
    expect(whitespaceResult.diagnostics).toHaveLength(0);
  });

  it("reports a single unary operator as a trailing operator", () => {
    const result = parseExpression("-");

    expect(result.root).toBeNull();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "PAR004",
      category: "syntax",
      severity: "error",
      span: {start: 0, end: 1},
    });
  });

  it("keeps an expression ending after binary operator usable", () => {
    const result = parseExpression("1 +");

    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "PAR004",
      category: "syntax",
      severity: "error",
      span: {start: 2, end: 3},
    });
  });

  it("keeps open function calls usable", () => {
    const result = parseExpression("sum(");

    expect(result.root?.kind).toBe("FunctionCall");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "PAR001",
      "PAR002",
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      category: "syntax",
      severity: "error",
      span: {start: 3, end: 4},
    });
  });

  it("keeps function calls with trailing comma usable", () => {
    const result = parseExpression("sum(User.age,");

    expect(result.root?.kind).toBe("FunctionCall");
    expect(result.root?.kind === "FunctionCall" ? result.root.arguments : []).toHaveLength(1);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "PAR001",
      "PAR002",
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      category: "syntax",
      severity: "error",
      span: {start: 12, end: 13},
    });
  });

  it("keeps dangling member access usable", () => {
    const result = parseExpression("User.");

    expect(result.root?.kind).toBe("Identifier");
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "PAR006",
      category: "syntax",
      severity: "error",
      span: {start: 4, end: 5},
    });
  });

  it("reports unexpected closing parenthesis with a focused span", () => {
    const result = parseExpression(")");

    expect(result.root).toBeNull();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "PAR000",
      category: "syntax",
      severity: "error",
      span: {start: 0, end: 1},
    });
  });

  it("reports nested incomplete grouping with useful spans", () => {
    const result = parseExpression("(1 + (2");

    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "PAR002",
      "PAR002",
    ]);
    expect(result.diagnostics.map((diagnostic) => diagnostic.span)).toEqual([
      {start: 5, end: 7},
      {start: 0, end: 7},
    ]);
  });
});
