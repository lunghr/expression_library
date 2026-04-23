import { processExpressionResult } from "@expression-editor/core";
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
}

export function EditorShell({
                              initialValue = "User.age > 18 && User.active",
                            }: EditorShellProps) {
  const [text, setText] = useState(initialValue);
  const catalog = useMemo(() => createDemoCatalog(), []);
  const result = useMemo(() => processExpressionResult(text, catalog), [catalog, text]);

  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <label htmlFor="expression-input">Expression</label>
        <textarea
          id="expression-input"
          style={textareaStyle}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div style={panelStyle}>
        <div>Status: {result.status}</div>
      </div>

      <div style={panelStyle}>
        <div>Diagnostics</div>
        {result.diagnostics.length === 0 ? (
          <div>No errors</div>
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
