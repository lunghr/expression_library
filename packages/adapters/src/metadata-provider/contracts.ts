import {
  createModelCatalog,
  loadMetadataDocument,
  type ModelCatalog,
} from "@expression-editor/core";

export interface MetadataProviderAdapter {
  loadMetadataSource(): Promise<unknown> | unknown;
}

export async function loadModelCatalogFromProvider(
  provider: MetadataProviderAdapter,
): Promise<ModelCatalog> {
  const source = await provider.loadMetadataSource();
  return createModelCatalog(loadMetadataDocument(source));
}
