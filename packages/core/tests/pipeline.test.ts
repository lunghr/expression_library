import { describe, expect, it } from "vitest";

import {
  createModelCatalog,
  loadMetadataDocument,
  parseExpression,
  processExpression,
  serializeExpression,
} from "../src/index.js";
import { tokenize } from "../src/lexer/index.js";

function createTestCatalog() {
  return createModelCatalog(
    loadMetadataDocument({
      models: [
        {
          name: "User",
          schema: {
            type: "object",
            properties: {
              age: {type: "number"},
              active: {type: "boolean"},
            },
          },
        },
      ],
    }),
  );
}

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

  it("tokenizes identifiers and dotted access", () => {
    const result = tokenize("order.total + user.age");

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "Identifier",
      "Dot",
      "Identifier",
      "Whitespace",
      "Plus",
      "Whitespace",
      "Identifier",
      "Dot",
      "Identifier",
      "End",
    ]);
  });

  it("tokenizes commas inside grouped expressions", () => {
    const result = tokenize("(user.age, 1)");

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "OpenParen",
      "Identifier",
      "Dot",
      "Identifier",
      "Comma",
      "Whitespace",
      "Number",
      "CloseParen",
      "End",
    ]);
  });

  it("tokenizes string, boolean, and unary syntax", () => {
    const result = tokenize('!"active" == true');

    expect(result.tokens.map((token) => token.kind)).toEqual([
      "Bang",
      "String",
      "Whitespace",
      "EqualEqual",
      "Whitespace",
      "Identifier",
      "End",
    ]);
  });

  it("reports invalid characters as invalid tokens and diagnostics", () => {
    const result = tokenize("1 + $");

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
    expect(result.diagnostics[0]?.span).toEqual({start: 4, end: 5});
  });

  it('parses and serializes "user"', () => {
    const result = parseExpression("user");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("Identifier");
    expect(result.root && "name" in result.root ? result.root.name : undefined).toBe("user");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("user");
  });

  it('parses and serializes "user.age"', () => {
    const result = parseExpression("user.age");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("MemberExpression");
    expect(result.root?.kind === "MemberExpression" ? result.root.object.kind : undefined).toBe("Identifier");
    expect(result.root?.kind === "MemberExpression" ? result.root.member.name : undefined).toBe("age");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("user.age");
  });

  it("parses and serializes string and boolean literals", () => {
    const stringResult = parseExpression('"Moscow"');
    const booleanResult = parseExpression("true");

    expect(stringResult.diagnostics).toHaveLength(0);
    expect(stringResult.root?.kind).toBe("StringLiteral");
    expect(stringResult.root ? serializeExpression(stringResult.root) : undefined).toBe('"Moscow"');

    expect(booleanResult.diagnostics).toHaveLength(0);
    expect(booleanResult.root?.kind).toBe("BooleanLiteral");
    expect(booleanResult.root ? serializeExpression(booleanResult.root) : undefined).toBe("true");
  });

  it("parses and serializes unary expressions", () => {
    const result = parseExpression("-(1 + 2) * !false");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("-(1 + 2) * !false");
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
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR004"]);
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

  it("parses member access inside mixed expressions", () => {
    const result = parseExpression("order.total + 5 > user.age");

    expect(result.diagnostics).toHaveLength(0);
    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.root?.kind === "BinaryExpression" ? result.root.operator : undefined).toBe(">");
    expect(result.root ? serializeExpression(result.root) : undefined).toBe("order.total + 5 > user.age");
  });

  it("reports an unexpected dot at expression start", () => {
    const result = parseExpression(".age");

    expect(result.root).toBeNull();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR005"]);
  });

  it("reports a missing identifier after dot", () => {
    const result = parseExpression("user.");

    expect(result.root?.kind).toBe("Identifier");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR006"]);
  });

  it("reports invalid identifier usage after a non-reference target", () => {
    const result = parseExpression("1.age");

    expect(result.root?.kind).toBe("NumberLiteral");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR007"]);
  });

  it("processes a full valid expression through the unified core pipeline", () => {
    const result = processExpression("User.age > 18 && User.active", createTestCatalog());

    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.boundRoot?.kind).toBe("BoundBinaryExpression");
    expect(result.diagnostics).toHaveLength(0);
    expect(result.serialized).toBe("User.age > 18 && User.active");
  });

  it("returns canonical serialization even when semantic diagnostics exist", () => {
    const result = processExpression("User.age + User.active", createTestCatalog());

    expect(result.root?.kind).toBe("BinaryExpression");
    expect(result.boundRoot?.kind).toBe("BoundBinaryExpression");
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["SEM004"]);
    expect(result.serialized).toBe("User.age + User.active");
  });

  it("returns no serialization when parsing fails to produce a root", () => {
    const result = processExpression("&& 1", createTestCatalog());

    expect(result.root).toBeNull();
    expect(result.boundRoot).toBeNull();
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(["PAR000"]);
    expect(result.serialized).toBeNull();
  });
});
