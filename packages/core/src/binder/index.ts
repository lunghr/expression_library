export interface BoundNode {
  readonly kind: string;
}

export interface BindingResult<TNode = BoundNode> {
  readonly root: TNode | null;
}
