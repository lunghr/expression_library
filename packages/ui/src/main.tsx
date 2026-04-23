import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { EditorShell } from "./editor-shell.js";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Missing root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <EditorShell/>
  </StrictMode>,
);
