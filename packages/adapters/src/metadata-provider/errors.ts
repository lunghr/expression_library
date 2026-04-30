import { MetadataLoadError } from "@expression-editor/core";

export class MetadataProviderLoadError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "MetadataProviderLoadError";
    this.cause = cause;
  }
}

export class MetadataProviderValidationError extends Error {
  readonly cause: MetadataLoadError;

  constructor(cause: MetadataLoadError) {
    super(cause.message);
    this.name = "MetadataProviderValidationError";
    this.cause = cause;
  }
}
