export type ProjectScalarSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean";

export interface ProjectScalarSchemaNode {
  readonly type: ProjectScalarSchemaType;
}

export interface ProjectObjectSchemaNode {
  readonly type: "object";
  readonly properties: Readonly<Record<string, ProjectSchemaNode>>;
}

export type ProjectSchemaNode = ProjectScalarSchemaNode | ProjectObjectSchemaNode;

export interface ProjectModelSchema {
  readonly name: string;
  readonly schema: ProjectObjectSchemaNode;
}

export interface ProjectMetadataDocument {
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
