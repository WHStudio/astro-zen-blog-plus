type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

export function rehypeLazyImages() {
  return (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return
      const props = node.properties ?? (node.properties = {})
      const priority = props.fetchpriority ?? props.fetchPriority
      if (props.loading == null && priority !== 'high') props.loading = 'lazy'
      if (props.decoding == null) props.decoding = 'async'
    })
  }
}
