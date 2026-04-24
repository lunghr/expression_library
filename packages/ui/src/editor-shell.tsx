import { getSuggestions, processExpressionResult } from "@expression-editor/core";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { createDemoCatalog } from "./demo-catalog.js";

const shellStyle = {
  display: "grid",
  gap: "12px",
  maxWidth: "880px",
  fontFamily: "sans-serif",
} satisfies CSSProperties;

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

const textareaStyle = {
  width: "100%",
  minHeight: "140px",
  resize: "vertical",
  fontFamily: "monospace",
  fontSize: "14px",
  padding: "8px",
} satisfies CSSProperties;

export interface EditorShellProps {
  readonly initialValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
}

export function EditorShell({
  initialValue = "User.age > 18 && User.active",
  value,
  onValueChange,
}: EditorShellProps) {
  const [internalText, setInternalText] = useState(initialValue);
  const [cursor, setCursor] = useState(initialValue.length);
  const catalog = useMemo(() => createDemoCatalog(), []);
  const text = value ?? internalText;
  const result = useMemo(() => processExpressionResult(text, catalog), [catalog, text]);
  const suggestions = useMemo(() => getSuggestions(text, cursor, catalog), [catalog, cursor, text]);
  const stateLabel = getStateLabel(result.status);

  function handleChange(nextValue: string): void {
    if (onValueChange) {
      onValueChange(nextValue);
      return;
    }

    setInternalText(nextValue);
  }

  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <label htmlFor="expression-input">Expression</label>
        <textarea
          id="expression-input"
          style={textareaStyle}
          value={text}
          onChange={(event) => {
            handleChange(event.target.value);
            setCursor(event.target.selectionStart ?? event.target.value.length);
          }}
          onSelect={(event) => {
            setCursor(event.currentTarget.selectionStart ?? text.length);
          }}
        />
      </div>

      <div style={panelStyle}>
        <div>Suggestions ({suggestions.items.length})</div>
        {suggestions.items.length === 0 ? (
          <div>No suggestions.</div>
        ) : (
          <ul>
            {suggestions.items.map((item, index) => (
              <li key={`${item.kind}-${item.label}-${index}`}>
                {item.kind}: {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={panelStyle}>
        <div>Processing State</div>
        <div>{stateLabel}</div>
      </div>

      <div style={panelStyle}>
        <div>Canonical Output</div>
        <div>{result.expression ?? "(none)"}</div>
      </div>

      <div style={panelStyle}>
        <div>Diagnostics ({result.diagnostics.length})</div>
        {result.diagnostics.length === 0 ? (
          <div>No diagnostics.</div>
        ) : (
          <ul>
            {result.diagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.code}-${diagnostic.span.start}-${diagnostic.span.end}-${index}`}>
                {diagnostic.code}: {diagnostic.message} [{diagnostic.span.start}, {diagnostic.span.end}]
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getStateLabel(status: string): string {
  switch (status) {
    case "success":
      return "Success";
    case "syntax_error":
      return "Syntax Error";
    case "semantic_error":
      return "Semantic Error";
    default:
      return status;
  }
}
