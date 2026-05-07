import { createDemoHostApplication } from "@expression-editor/adapters";
import type {
  ModelCatalog,
  PreviewContext,
  RootBindingContext,
} from "@expression-editor/core";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { DemoPlayground } from "./demo-playground.js";
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
  readonly rootBindings: RootBindingContext;
  submitExpression(source: string): Promise<DemoHostSubmitResult>;
  refreshMetadata(): Promise<ModelCatalog>;
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
  const [catalog, setCatalog] = useState<ModelCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshingMetadata, setIsRefreshingMetadata] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initializeHostApplication(): Promise<void> {
      try {
        const hostApplication = createDemoHostApplication();
        const nextServices = await hostApplication.initialize();

        if (!cancelled) {
          const typedServices = nextServices as unknown as DemoHostServices;
          setServices(typedServices);
          setCatalog(typedServices.catalog);
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

  if (services === null || catalog === null) {
    return <div>Initializing demo host application...</div>;
  }

  const rootBindings = services.rootBindings;
  const previewContext = createDemoPreviewContext(rootBindings);

  return (
    <DemoPlayground
      catalog={catalog}
      isRefreshingMetadata={isRefreshingMetadata}
      onRefreshMetadata={async () => {
        setIsRefreshingMetadata(true);

        try {
          const nextCatalog = await services.refreshMetadata();
          setCatalog(nextCatalog);
        } finally {
          setIsRefreshingMetadata(false);
        }
      }}
      onSubmitExpression={async (source) => {
        const submission = await services.submitExpression(source);
        return mapSubmissionResult(submission);
      }}
      previewContext={previewContext}
      rootBindings={rootBindings}
    />
  );
}

function createDemoPreviewContext(
  rootBindings: RootBindingContext,
): PreviewContext {
  const previewContext: Record<string, PreviewContext[string]> = {};

  for (const binding of rootBindings.bindings) {
    previewContext[binding.name] = createSampleValue(binding.modelName);
  }

  return previewContext;
}

function createSampleValue(modelName: string): PreviewContext[string] {
  if (modelName === "User") {
    return {
      age: 27,
      active: true,
      address: {
        city: "Moscow",
      },
    };
  }

  if (modelName === "Order") {
    return {
      total: 90,
      status: "Open",
    };
  }

  return {};
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
