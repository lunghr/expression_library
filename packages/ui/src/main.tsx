import { createDemoHostApplication, type HostApplicationServices } from "@expression-editor/adapters";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { EditorShell } from "./editor-shell.js";

function DemoApplication() {
  const [services, setServices] = useState<HostApplicationServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeHostApplication(): Promise<void> {
      try {
        const hostApplication = createDemoHostApplication();
        const nextServices = await hostApplication.initialize();

        if (!cancelled) {
          setServices(nextServices);
        }
      } catch (cause) {
        if (!cancelled) {
          const message = cause instanceof Error
            ? cause.message
            : "Failed to initialize demo host application.";
          setError(message);
        }
      }
    }

    void initializeHostApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error !== null) {
    return <div>Initialization error: {error}</div>;
  }

  if (services === null) {
    return <div>Initializing demo host application...</div>;
  }

  return <EditorShell catalog={services.catalog}/>;
}

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Missing root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <DemoApplication/>
  </StrictMode>,
);
