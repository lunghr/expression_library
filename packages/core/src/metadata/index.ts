export type {
  LoadedMetadataDocument,
  MetadataField,
  MetadataModel,
  MetadataValueKind,
  ProjectSchemaDialect,
  ProjectMetadataDocument,
  ProjectModelSchema,
  ProjectObjectSchemaNode,
  ProjectReferenceSchemaNode,
  ProjectScalarSchemaNode,
  ProjectScalarSchemaType,
  ProjectSchemaNode,
} from "./contracts.js";

export type { MetadataIssue, MetadataIssueCode } from "./errors.js";
export { MetadataLoadError } from "./errors.js";
export { loadMetadataDocument } from "./load-model-schemas.js";
