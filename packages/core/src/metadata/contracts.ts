export type ProjectScalarSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean";

export type ProjectSchemaDialect = "https://json-schema.org/draft/2020-12/schema";

export interface ProjectScalarSchemaNode {
  readonly type: ProjectScalarSchemaType;
}

export interface ProjectReferenceSchemaNode {
  readonly $ref: string;
}

export interface ProjectObjectSchemaNode {
  readonly type: "object";
  readonly properties: Readonly<Record<string, ProjectSchemaNode>>;
  readonly $defs?: Readonly<Record<string, ProjectSchemaNode>>;
}

export type ProjectSchemaNode =
  | ProjectScalarSchemaNode
  | ProjectObjectSchemaNode
  | ProjectReferenceSchemaNode;

export interface ProjectModelSchema {
  readonly name: string;
  readonly schema: ProjectObjectSchemaNode;
}

export interface ProjectMetadataDocument {
  readonly $schema?: ProjectSchemaDialect;
  readonly models: readonly ProjectModelSchema[];
}

export type MetadataValueKind = "scalar" | "object";

export interface MetadataField {
  readonly name: string;
  readonly path: readonly string[];
  readonly kind: MetadataValueKind;
  readonly valueType: string;
  readonly fields: readonly MetadataField[];
}

export interface MetadataModel {
  readonly name: string;
  readonly fields: readonly MetadataField[];
}

export interface LoadedMetadataDocument {
  readonly models: readonly MetadataModel[];
}
