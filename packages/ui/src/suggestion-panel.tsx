import type { SuggestionResult } from "@expression-editor/core";
import type { CSSProperties } from "react";

const panelStyle = {
  border: "1px solid #d0d0d0",
  padding: "12px",
} satisfies CSSProperties;

export interface SuggestionPanelProps {
  readonly suggestions: SuggestionResult;
}

export function SuggestionPanel({suggestions}: SuggestionPanelProps) {
  return (
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
  );
}
