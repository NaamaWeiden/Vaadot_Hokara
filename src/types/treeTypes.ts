export interface TreeNode {
  key: string
  label: string
  isExpanded?: boolean
  children: TreeNode[]
}

// The committee (leaf node) currently selected in the sidebar tree
export interface Committee {
  key: string
  name: string
  // Label of the parent node in the tree (the command/unit the committee belongs to)
  unit: string
}
