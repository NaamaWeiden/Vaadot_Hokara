<template>
  <div class="resource-tree w-100">
    <ResourceTreeNode
      v-for="root in nestedTreeItems"
      :key="root.key"
      :item="root"
      :selectedNode="selectedNode"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ResourceTreeNode from './ResourceTreeNode.vue'
import type { TreeNode, Committee } from '@/types/treeTypes'
import { findParentLabel } from '@/utils/tree.utils'
import mockTree from '@/mock/tree.json'

const props = defineProps({
  search: { type: String, default: '' }
})

const emit = defineEmits<{
  (e: 'select-committee', committee: Committee | null): void
}>()

// UI stage: the tree comes from a mock file until a real data source (store/DL) exists
const treeNodes = ref<TreeNode[]>(mockTree as TreeNode[])

const selectedNode = ref('')

// A committee is a leaf node; selecting a parent (command) clears the selected committee
function onSelect(node: TreeNode) {
  selectedNode.value = node.key
  const isCommittee = !node.children?.length
  emit(
    'select-committee',
    isCommittee
      ? {
          key: node.key,
          name: node.label,
          // Searches the original (unfiltered) tree, so it works while a search filter is active
          unit: findParentLabel(treeNodes.value, node.key) ?? '',
        }
      : null
  )
}

const nestedTreeItems = computed(() => {
  const roots = treeNodes.value

  // Apply search filter if present
  if (!props.search) return roots

  const searchText = props.search.toLowerCase()

  function filterNode(node: TreeNode, forceKeep: boolean = false): boolean {
    const match = node.label.toLowerCase().includes(searchText)
    const shouldKeep = match || forceKeep

    if (node.children && node.children.length) {
      // Recursively filter children. If this node matches, we force keep its children.
      node.children = node.children.filter((child: TreeNode) => filterNode(child, shouldKeep))
      if (node.children.length > 0) {
        if (!match) {
          node.isExpanded = true
        }
        return true
      }
    }
    return shouldKeep
  }

  // Clone roots to avoid mutating the original state during filtering
  const deepCloneRoots: TreeNode[] = JSON.parse(JSON.stringify(roots))
  return deepCloneRoots.filter((root: TreeNode) => filterNode(root))
})
</script>

<style scoped>
.resource-tree {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
