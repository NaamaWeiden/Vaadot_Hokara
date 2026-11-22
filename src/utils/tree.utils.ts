import type { TreeNode } from '@/types/treeTypes'

// Label of the parent of the node with the given key ('' for a root node, undefined if not found)
export function findParentLabel(
  nodes: TreeNode[],
  key: string,
  parentLabel = ''
): string | undefined {
  for (const node of nodes) {
    if (node.key === key) return parentLabel
    const found = findParentLabel(node.children ?? [], key, node.label)
    if (found !== undefined) return found
  }
  return undefined
}
