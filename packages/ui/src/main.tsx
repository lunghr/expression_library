import { createDemoHostApplication } from "@expression-editor/adapters";
import type { ModelCatalog } from "@expression-editor/core";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { EditorShell } from "./editor-shell.js";
import type { SubmissionResultView } from "./submission-result.js";

interface DemoHostSubmitResult {
  readonly transport:
    | {
      readonly status: "not_sent";
      readonly reason: string;
    }
    | {
      readonly status: "transport_error";
      readonly message: string;
    }
    | {
      readonly status: "sent";
      readonly response: {
        readonly expression: string | null;
        readonly executionResult:
          | {
            readonly status: "success";
            readonly value: unknown;
          }
          | {
            readonly status: "error";
            readonly message: string;
          };
      };
    };
}

interface DemoHostServices {
  readonly catalog: ModelCatalog;
  submitExpression(source: string): Promise<DemoHostSubmitResult>;
}

function mapSubmissionResult(
  submission: DemoHostSubmitResult,
): SubmissionResultView {
  switch (submission.transport.status) {
    case "not_sent":
      return {
        status: "not_sent",
        reason: submission.transport.reason,
      };
    case "transport_error":
      return {
        status: "transport_error",
        message: submission.transport.message,
      };
    case "sent":
      return {
        status: "sent",
        expression: submission.transport.response.expression,
        executionResult: submission.transport.response.executionResult,
      };
    default:
      return submission.transport;
  }
}

function DemoApplication() {
  const [services, setServices] = useState<DemoHostServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeHostApplication(): Promise<void> {
      try {
        const hostApplication = createDemoHostApplication();
        const nextServices = await hostApplication.initialize();

        if (!cancelled) {
          setServices(nextServices as DemoHostServices);
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

  return (
    <EditorShell
      catalog={services.catalog}
      onSubmitExpression={async (source) => {
        const submission = await services.submitExpression(source);
        return mapSubmissionResult(submission);
      }}
    />
  );
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
