import {
  MetadataLoadError,
  createModelCatalog,
  loadMetadataDocument,
  type ModelCatalog,
} from "@expression-editor/core";

import {
  MetadataProviderLoadError,
  MetadataProviderValidationError,
} from "./errors.js";

export interface MetadataProviderAdapter {
  loadMetadataSource(): Promise<unknown> | unknown;
}

export async function loadModelCatalogFromProvider(
  provider: MetadataProviderAdapter,
): Promise<ModelCatalog> {
  let source: unknown;

  try {
    source = await provider.loadMetadataSource();
  } catch (cause) {
    throw new MetadataProviderLoadError(
      "Metadata provider failed to load metadata source.",
      cause,
    );
  }

  try {
    return createModelCatalog(loadMetadataDocument(source));
  } catch (cause) {
    if (cause instanceof MetadataLoadError) {
      throw new MetadataProviderValidationError(cause);
    }

    throw cause;
  }
}

export async function reloadModelCatalogFromProvider(
  provider: MetadataProviderAdapter,
): Promise<ModelCatalog> {
  return loadModelCatalogFromProvider(provider);
}
