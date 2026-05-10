export type PreviewValue =
  | null
  | boolean
  | number
  | string
  | PreviewValue[]
  | { readonly [key: string]: PreviewValue };

export type PreviewContext = { readonly [key: string]: PreviewValue };

export interface KnownPreviewResult {
  readonly status: "known";
  readonly value: PreviewValue;
}

export interface UnknownPreviewResult {
  readonly status: "unknown";
}

export interface ErrorPreviewResult {
  readonly status: "error";
  readonly message: string;
}

export type PreviewResult =
  | KnownPreviewResult
  | UnknownPreviewResult
  | ErrorPreviewResult;
