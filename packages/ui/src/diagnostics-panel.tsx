import type { Diagnostic } from "@expression-editor/core";
import type { CSSProperties } from "react";

const panelStyle = {
  border: "1px solid #d0d0d0",
  borderRadius: "10px",
  backgroundColor: "#fafafa",
  overflow: "hidden",
} satisfies CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  color: "#374151",
} satisfies CSSProperties;

const statusStyle = {
  color: "#6b7280",
  fontSize: "12px",
} satisfies CSSProperties;

const emptyStateStyle = {
  padding: "12px",
  color: "#6b7280",
  fontSize: "13px",
} satisfies CSSProperties;

const listStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
} satisfies CSSProperties;

const rowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "10px 12px",
  borderTop: "1px solid #eceff3",
} satisfies CSSProperties;

const badgeStyle = {
  minWidth: "40px",
  color: "#991b1b",
  fontSize: "11px",
  textTransform: "uppercase",
  flexShrink: 0,
} satisfies CSSProperties;

const contentStyle = {
  display: "grid",
  gap: "2px",
  minWidth: 0,
  flex: 1,
} satisfies CSSProperties;

const titleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
} satisfies CSSProperties;

const codeStyle = {
  color: "#111827",
  fontSize: "12px",
  fontWeight: 600,
  flexShrink: 0,
} satisfies CSSProperties;

const messageStyle = {
  color: "#374151",
  fontSize: "13px",
  minWidth: 0,
} satisfies CSSProperties;

const spanStyle = {
  color: "#6b7280",
  fontSize: "12px",
} satisfies CSSProperties;

export interface DiagnosticsPanelProps {
  readonly diagnostics: readonly Diagnostic[];
  readonly isMetadataReady?: boolean;
}

export function DiagnosticsPanel({
  diagnostics,
  isMetadataReady = true,
}: DiagnosticsPanelProps) {
  return (
    <div data-testid="diagnostics-panel" style={panelStyle}>
      <div style={headerStyle}>
        <div>Problems</div>
        <div style={statusStyle}>{getStatusLabel(diagnostics.length, isMetadataReady)}</div>
      </div>
      {!isMetadataReady ? (
        <div style={emptyStateStyle}>Metadata is not ready.</div>
      ) : diagnostics.length === 0 ? (
        <div style={emptyStateStyle}>No problems.</div>
      ) : (
        <ul style={listStyle}>
          {diagnostics.map((diagnostic, index) => (
            <li
              key={`${diagnostic.code}-${diagnostic.span.start}-${diagnostic.span.end}-${index}`}
              style={rowStyle}
            >
              <div style={badgeStyle}>{diagnostic.severity}</div>
              <div style={contentStyle}>
                <div style={titleRowStyle}>
                  <span style={codeStyle}>{diagnostic.code}</span>
                  <span style={messageStyle}>{diagnostic.message}</span>
                </div>
                <div style={spanStyle}>
                  {diagnostic.category} [{diagnostic.span.start}, {diagnostic.span.end}]
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getStatusLabel(count: number, isMetadataReady: boolean): string {
  if (!isMetadataReady) {
    return "Unavailable";
  }

  if (count === 0) {
    return "Clear";
  }

  return `${count} item${count === 1 ? "" : "s"}`;
}
