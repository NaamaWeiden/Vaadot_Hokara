export interface TreeNode {
  key: string
  label: string
  isExpanded?: boolean
  children: TreeNode[]
}

// The committee (leaf node) currently selected in the sidebar tree
// TODO: the optional fields are based on the edit-committee popup design.
// Update them once the server defines the real committee structure.
export interface Committee {
  key: string
  name: string
  // Label of the parent node in the tree (the command/unit the committee belongs to)
  unit: string
  type?: string
  startDate?: string
  endDate?: string
  managers?: string[]
  viewers?: string[]
  // Columns shown in the candidates table (up to 10)
  displayColumns?: string[]
}

// The editable draft used by the create/edit committee popup.
// Every field is required so each input always has a value, and there is no key since a new committee has none yet.
export type CommitteeForm = Required<Omit<Committee, 'key'>>
