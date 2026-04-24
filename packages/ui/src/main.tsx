import { createModelCatalog, loadMetadataDocument } from "@expression-editor/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { EditorShell } from "./editor-shell.js";
const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Missing root element.");
}

const demoCatalog = createModelCatalog(
  loadMetadataDocument({
    models: [
      {
        name: "User",
        schema: {
          type: "object",
          properties: {
            age: { type: "number" },
            active: { type: "boolean" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
              },
            },
          },
        },
      },
    ],
  }),
);

createRoot(rootElement).render(
  <StrictMode>
    <EditorShell catalog={demoCatalog} />
  </StrictMode>,
);
