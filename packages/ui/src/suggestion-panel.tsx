import type { SuggestionItem, SuggestionResult } from "@expression-editor/core";
import type { CSSProperties } from "react";

const popupStyle = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  zIndex: 20,
  minWidth: "280px",
  maxWidth: "420px",
  border: "1px solid #d0d0d0",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
  overflow: "hidden",
} satisfies CSSProperties;

const listStyle = {
  listStyle: "none",
  margin: 0,
  padding: "6px",
} satisfies CSSProperties;

const itemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  width: "100%",
  padding: "8px 10px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "transparent",
  textAlign: "left",
  cursor: "pointer",
} satisfies CSSProperties;

const activeItemStyle = {
  ...itemStyle,
  backgroundColor: "#e8f0ff",
} satisfies CSSProperties;

const leftPartStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
} satisfies CSSProperties;

const kindStyle = {
  color: "#5b6472",
  fontSize: "12px",
  textTransform: "uppercase",
  flexShrink: 0,
} satisfies CSSProperties;

const labelStyle = {
  color: "#111827",
  fontSize: "14px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} satisfies CSSProperties;

const detailStyle = {
  color: "#6b7280",
  fontSize: "12px",
  whiteSpace: "nowrap",
  flexShrink: 0,
} satisfies CSSProperties;

export interface SuggestionPanelProps {
  readonly suggestions: SuggestionResult;
  readonly isOpen?: boolean;
  readonly activeIndex?: number;
  readonly onSelect?: (index: number) => void;
}

export function SuggestionPanel({
  suggestions,
  isOpen = false,
  activeIndex = 0,
  onSelect,
}: SuggestionPanelProps) {
  if (!isOpen || suggestions.items.length === 0) {
    return null;
  }

  return (
    <div style={popupStyle}>
      <ul style={listStyle}>
        {suggestions.items.map((item, index) => (
          <li key={`${item.kind}-${item.label}-${index}`}>
            <button
              onClick={() => {
                onSelect?.(index);
              }}
              style={index === activeIndex ? activeItemStyle : itemStyle}
              type="button"
            >
              <span style={leftPartStyle}>
                <span style={kindStyle}>{item.kind}</span>
                <span style={labelStyle}>{item.label}</span>
              </span>
              {item.detail === undefined ? null : (
                <span style={detailStyle}>{item.detail}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
