type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

function classNames(node: HastNode): string[] {
  const value = node.properties?.className ?? node.properties?.class
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean)
  return []
}

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textOf).join('')
}

function isCheckbox(node: HastNode): boolean {
  return node.type === 'element' && node.tagName === 'input' && node.properties?.type === 'checkbox'
}

function isNestedList(node: HastNode): boolean {
  return node.type === 'element' && (node.tagName === 'ul' || node.tagName === 'ol')
}

function labelTaskItem(item: HastNode) {
  const children = item.children ?? []
  const inputIndex = children.findIndex(isCheckbox)
  if (inputIndex === -1) return

  let end = inputIndex + 1
  while (end < children.length && !isNestedList(children[end])) end += 1

  const input = children[inputIndex]
  const wrapped = children.slice(inputIndex, end)
  const labelText = textOf({ type: 'root', children: wrapped.filter((node) => node !== input) }).trim()
  if (!labelText) {
    input.properties = { ...input.properties, ariaLabel: '待办事项' }
    return
  }

  const label: HastNode = {
    type: 'element',
    tagName: 'label',
    properties: {},
    children: wrapped,
  }
  item.children = [...children.slice(0, inputIndex), label, ...children.slice(end)]
}

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

/** Give remark-gfm task checkboxes an accessible name from the item text. */
export function rehypeTaskListLabels() {
  return (tree: HastNode) => {
    const items: HastNode[] = []
    walk(tree, (node) => {
      if (node.type === 'element' && node.tagName === 'li' && classNames(node).includes('task-list-item')) {
        items.push(node)
      }
    })
    for (const item of items) labelTaskItem(item)
  }
}
