import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";

import type {
  LoadedMetadataDocument,
  MetadataField,
  MetadataModel,
  ProjectMetadataDocument,
  ProjectObjectSchemaNode,
  ProjectReferenceSchemaNode,
  ProjectSchemaNode,
} from "./contracts.js";
import {
  buildMetadataErrorMessage,
  createMetadataIssue,
  MetadataLoadError,
  type MetadataIssue,
} from "./errors.js";

const metadataDocumentSchema = {
  $id: "expression-editor/project-metadata-document",
  type: "object",
  additionalProperties: false,
  required: ["models"],
  properties: {
    $schema: {
      const: "https://json-schema.org/draft/2020-12/schema",
    },
    models: {
      type: "array",
      items: {
        $ref: "#/$defs/model",
      },
    },
  },
  $defs: {
    model: {
      type: "object",
      additionalProperties: false,
      required: ["name", "schema"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
        },
        schema: {
          $ref: "#/$defs/objectNode",
        },
      },
    },
    node: {
      oneOf: [
        {
          $ref: "#/$defs/scalarNode",
        },
        {
          $ref: "#/$defs/objectNode",
        },
        {
          $ref: "#/$defs/referenceNode",
        },
      ],
    },
    scalarNode: {
      type: "object",
      additionalProperties: false,
      required: ["type"],
      properties: {
        type: {
          enum: ["string", "number", "integer", "boolean"],
        },
      },
    },
    referenceNode: {
      type: "object",
      additionalProperties: false,
      required: ["$ref"],
      properties: {
        $ref: {
          type: "string",
          minLength: 1,
          pattern: "^#/.+",
        },
      },
    },
    objectNode: {
      type: "object",
      additionalProperties: false,
      required: ["type", "properties"],
      properties: {
        type: {
          const: "object",
        },
        properties: {
          type: "object",
          propertyNames: {
            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
          },
          additionalProperties: {
            $ref: "#/$defs/node",
          },
        },
        $defs: {
          type: "object",
          propertyNames: {
            pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
          },
          additionalProperties: {
            $ref: "#/$defs/node",
          },
        },
      },
    },
  },
} as const;

const ajv = new Ajv2020.default({
  allErrors: true,
  strict: true,
});

const validateMetadataDocument = ajv.compile(metadataDocumentSchema);

export function loadMetadataDocument(
  source: unknown,
): LoadedMetadataDocument {
  if (!validateMetadataDocument(source)) {
    const issues = (validateMetadataDocument.errors ?? []).map((error: ErrorObject) =>
      createMetadataIssue(
        "META_SCHEMA_INVALID",
        error.instancePath === "" ? "/metadata" : error.instancePath,
        error.message ?? "Invalid metadata structure.",
      ));

    throw new MetadataLoadError(
      `Invalid project metadata document: ${buildMetadataErrorMessage(issues)}`,
      issues,
    );
  }

  const document = source as ProjectMetadataDocument;

  return {
    models: document.models.map((model) => normalizeModel(model.name, model.schema)),
  };
}

function normalizeModel(
  name: string,
  schema: ProjectObjectSchemaNode,
): MetadataModel {
  const issues: MetadataIssue[] = [];
  return {
    name,
    fields: Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
      normalizeField(fieldName, fieldSchema, [fieldName], schema, issues)),
  };
}

function normalizeField(
  name: string,
  schema: ProjectSchemaNode,
  path: readonly string[],
  modelSchema: ProjectObjectSchemaNode,
  issues: MetadataIssue[],
  visitedRefs = new Set<string>(),
): MetadataField {
  if (isReferenceNode(schema)) {
    const resolvedSchema = resolveReferenceNode(
      schema,
      modelSchema,
      path,
      issues,
      visitedRefs,
    );

    if (resolvedSchema === null) {
      throw new MetadataLoadError(
        `Invalid project metadata document: ${buildMetadataErrorMessage(issues)}`,
        issues,
      );
    }

    return normalizeField(
      name,
      resolvedSchema,
      path,
      modelSchema,
      issues,
      visitedRefs,
    );
  }

  if (schema.type === "object") {
    return {
      name,
      path,
      kind: "object",
      valueType: "object",
      fields: Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
        normalizeField(
          fieldName,
          fieldSchema,
          [...path, fieldName],
          modelSchema,
          issues,
          new Set(visitedRefs),
        )),
    };
  }

  return {
    name,
    path,
    kind: "scalar",
    valueType: schema.type,
    fields: [],
  };
}

function isReferenceNode(
  schema: ProjectSchemaNode,
): schema is ProjectReferenceSchemaNode {
  return "$ref" in schema;
}

function resolveReferenceNode(
  schema: ProjectReferenceSchemaNode,
  modelSchema: ProjectObjectSchemaNode,
  path: readonly string[],
  issues: MetadataIssue[],
  visitedRefs: Set<string>,
): ProjectSchemaNode | null {
  if (visitedRefs.has(schema.$ref)) {
    issues.push(
      createMetadataIssue(
        "META_REF_CYCLE",
        formatPath(path),
        `Circular reference "${schema.$ref}" is not supported.`,
      ),
    );
    return null;
  }

  visitedRefs.add(schema.$ref);

  const resolvedNode = resolveJsonPointer(modelSchema, schema.$ref);

  if (resolvedNode === null) {
    issues.push(
      createMetadataIssue(
        "META_REF_INVALID",
        formatPath(path),
        `Reference "${schema.$ref}" could not be resolved.`,
      ),
    );
    return null;
  }

  if (!isProjectSchemaNode(resolvedNode)) {
    issues.push(
      createMetadataIssue(
        "META_REF_TARGET_INVALID",
        formatPath(path),
        `Reference "${schema.$ref}" does not point to a supported schema node.`,
      ),
    );
    return null;
  }

  return resolvedNode;
}

function resolveJsonPointer(
  source: unknown,
  pointer: string,
): unknown | null {
  if (!pointer.startsWith("#/")) {
    return null;
  }

  const segments = pointer
    .slice(2)
    .split("/")
    .map(unescapePointerSegment);

  let current: unknown = source;

  for (const segment of segments) {
    if (typeof current !== "object" || current === null || !(segment in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function unescapePointerSegment(segment: string): string {
  return segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function isProjectSchemaNode(value: unknown): value is ProjectSchemaNode {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if ("$ref" in value && typeof value.$ref === "string") {
    return true;
  }

  if ("type" in value) {
    return typeof value.type === "string";
  }

  return false;
}

function formatPath(path: readonly string[]): string {
  return path.length === 0 ? "/metadata" : `/${path.join("/")}`;
}
