import type { Diagnostic } from "@expression-editor/core";
import type { CSSProperties } from "react";

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface DiagnosticsPanelProps {
  readonly diagnostics: readonly Diagnostic[];
}

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  return (
    <div style={panelStyle}>
      <div>Diagnostics ({diagnostics.length})</div>
      {diagnostics.length === 0 ? (
        <div>No diagnostics.</div>
      ) : (
        <ul>
          {diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${diagnostic.span.start}-${diagnostic.span.end}-${index}`}>
              {diagnostic.code}: {diagnostic.message} [{diagnostic.span.start}, {diagnostic.span.end}]
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
