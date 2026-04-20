export interface MetadataFieldDefinition {
  readonly name: string;
  readonly type: string;
}

export interface MetadataSchema {
  readonly version: string;
  readonly fields: readonly MetadataFieldDefinition[];
}
