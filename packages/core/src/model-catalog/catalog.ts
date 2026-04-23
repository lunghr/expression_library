import type { LoadedMetadataDocument, MetadataField, MetadataModel } from "../metadata/index.js";

export interface ModelCatalog {
  readonly models: readonly MetadataModel[];

  getModel(name: string): MetadataModel | null;

  getField(modelName: string, fieldName: string): MetadataField | null;

  getFieldByPath(modelName: string, path: readonly string[]): MetadataField | null;

  getChildField(parentField: MetadataField, fieldName: string): MetadataField | null;
}

export function createModelCatalog(
  metadata: LoadedMetadataDocument,
): ModelCatalog {
  const modelsByName = new Map(metadata.models.map((model) => [model.name, model]));

  return {
    models: metadata.models,
    getModel(name: string): MetadataModel | null {
      return modelsByName.get(name) ?? null;
    },
    getField(modelName: string, fieldName: string): MetadataField | null {
      const model = modelsByName.get(modelName);

      if (!model) {
        return null;
      }

      return model.fields.find((field) => field.name === fieldName) ?? null;
    },
    getFieldByPath(modelName: string, path: readonly string[]): MetadataField | null {
      const model = modelsByName.get(modelName);

      if (!model || path.length === 0) {
        return null;
      }

      let currentField = model.fields.find((field) => field.name === path[0]) ?? null;

      for (const segment of path.slice(1)) {
        if (!currentField || currentField.kind !== "object") {
          return null;
        }

        currentField = currentField.fields.find((field) => field.name === segment) ?? null;
      }

      return currentField;
    },
    getChildField(parentField: MetadataField, fieldName: string): MetadataField | null {
      if (parentField.kind !== "object") {
        return null;
      }

      return parentField.fields.find((field) => field.name === fieldName) ?? null;
    },
  };
}
