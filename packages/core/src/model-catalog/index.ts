export interface ModelCatalogEntry {
  readonly id: string;
  readonly label: string;
}

export interface ModelCatalog {
  readonly entries: readonly ModelCatalogEntry[];
}
