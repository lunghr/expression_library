import { Ajv } from "ajv";

import type {
  LoadedMetadataDocument,
  MetadataField,
  MetadataModel,
  ProjectMetadataDocument,
  ProjectObjectSchemaNode,
  ProjectSchemaNode,
} from "./contracts.js";

const metadataDocumentSchema = {
  $id: "expression-editor/project-metadata-document",
  type: "object",
  additionalProperties: false,
  required: ["models"],
  properties: {
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
      },
    },
  },
} as const;

const ajv = new Ajv({
  allErrors: true,
  strict: true,
});

const validateMetadataDocument = ajv.compile(metadataDocumentSchema);

export function loadMetadataDocument(
  source: unknown,
): LoadedMetadataDocument {
  if (!validateMetadataDocument(source)) {
    const details = ajv.errorsText(validateMetadataDocument.errors, {
      separator: "; ",
      dataVar: "metadata",
    });
    throw new Error(`Invalid project metadata document: ${details}`);
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
  return {
    name,
    fields: Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
      normalizeField(fieldName, fieldSchema, [fieldName])),
  };
}

function normalizeField(
  name: string,
  schema: ProjectSchemaNode,
  path: readonly string[],
): MetadataField {
  if (schema.type === "object") {
    return {
      name,
      path,
      kind: "object",
      valueType: "object",
      fields: Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
        normalizeField(fieldName, fieldSchema, [...path, fieldName])),
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
