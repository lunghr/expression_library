export type MetadataIssueCode =
  | "META_SCHEMA_INVALID"
  | "META_REF_INVALID"
  | "META_REF_TARGET_INVALID"
  | "META_REF_CYCLE";

export interface MetadataIssue {
  readonly code: MetadataIssueCode;
  readonly path: string;
  readonly message: string;
}

export class MetadataLoadError extends Error {
  public readonly issues: readonly MetadataIssue[];

  public constructor(message: string, issues: readonly MetadataIssue[]) {
    super(message);
    this.name = "MetadataLoadError";
    this.issues = issues;
  }
}

export function createMetadataIssue(
  code: MetadataIssueCode,
  path: string,
  message: string,
): MetadataIssue {
  return {
    code,
    path,
    message,
  };
}

export function buildMetadataErrorMessage(
  issues: readonly MetadataIssue[],
): string {
  return issues
    .map((issue) => `${issue.code} at ${issue.path}: ${issue.message}`)
    .join("; ");
}
