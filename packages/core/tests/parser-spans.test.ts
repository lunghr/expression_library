import { describe, expect, it } from "vitest";

import { parseExpression, tokenize } from "../src/index.js";

describe("parser layout and spans", () => {
  it("keeps token spans for dotted member access", () => {
    const result = tokenize("user.age");

    expect(result.tokens.map((token) => ({
      kind: token.kind,
      span: token.span,
    }))).toEqual([
      {kind: "Identifier", span: {start: 0, end: 4}},
      {kind: "Dot", span: {start: 4, end: 5}},
      {kind: "Identifier", span: {start: 5, end: 8}},
      {kind: "End", span: {start: 8, end: 8}},
    ]);
  });

  it("keeps root and operator spans for binary expressions", () => {
    const result = parseExpression("user.age + 5");

    expect(result.root?.kind).toBe("BinaryExpression");

    if (result.root?.kind !== "BinaryExpression") {
      throw new Error("Expected BinaryExpression root.");
    }

    expect(result.root.span).toEqual({start: 0, end: 12});
    expect(result.root.operatorSpan).toEqual({start: 9, end: 10});
    expect(result.root.left.span).toEqual({start: 0, end: 8});
    expect(result.root.right.span).toEqual({start: 11, end: 12});
  });

  it("keeps span for unary expressions", () => {
    const result = parseExpression("!user.active");

    expect(result.root?.kind).toBe("UnaryExpression");

    if (result.root?.kind !== "UnaryExpression") {
      throw new Error("Expected UnaryExpression root.");
    }

    expect(result.root.span).toEqual({start: 0, end: 12});
    expect(result.root.operatorSpan).toEqual({start: 0, end: 1});
    expect(result.root.operand.span).toEqual({start: 1, end: 12});
  });

  it("keeps diagnostic span for missing closing parenthesis", () => {
    const result = parseExpression("(1 + 2");

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe("PAR002");
    expect(result.diagnostics[0]?.span).toEqual({start: 0, end: 6});
  });

  it("keeps diagnostic span for trailing operator", () => {
    const result = parseExpression("1 +");

    const trailingOperator = result.diagnostics.find((diagnostic) => diagnostic.code === "PAR004");
    expect(trailingOperator?.span).toEqual({start: 2, end: 3});
  });

  it("keeps invalid member access usable during typing", () => {
    const result = parseExpression("user.");

    expect(result.root?.kind).toBe("Identifier");
    expect(result.root?.span).toEqual({start: 0, end: 4});
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR006"]);
    expect(result.diagnostics[0]?.span).toEqual({start: 4, end: 5});
  });

  it("keeps incomplete grouping usable during typing", () => {
    const result = parseExpression("(User.age");

    expect(result.root?.kind).toBe("MemberExpression");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR002"]);
    expect(result.root?.span).toEqual({start: 1, end: 9});
  });
});
