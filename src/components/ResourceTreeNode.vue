<template>
  <div class="tree-node">
    <div
      class="node-content d-flex align-center cursor-pointer my-1"
      :class="{ selected: isSelected }"
      :style="{
        marginRight: `calc(0.5rem + ${level * 1.2}rem)`,
        marginLeft: '0.5rem',
        paddingRight: '1rem'
      }"
      @click="toggleOrSelect"
    >
      <!-- <div v-if="item.icon" class="node-icon ml-2">
        <img :src="item.icon" alt="" />
      </div> -->

      <div class="node-text text-truncate flex-grow-1">
        {{ item.label }}
      </div>

      <div v-if="item.children?.length" class="node-action" @click.stop="toggle">
        <v-icon size="small" :color="isSelected ? 'white' : '#8C8FA7'">
          {{ isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
      </div>
    </div>

    <v-expand-transition>
      <div v-if="isOpen && item.children?.length" class="node-children position-relative">
        <div
          class="vertical-line"
          v-if="level >= 1"
          :style="{ right: `calc(1rem + ${level * 1.2 + 0.6}rem)` }"
        ></div>
        <ResourceTreeNode
          v-for="child in item.children"
          :key="child.key"
          :item="child"
          :selectedNode="selectedNode"
          :level="level + 1"
          @select="$emit('select', $event)"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }, // Ideally PropType<TreeNode>
  selectedNode: { type: String, default: '' },
  level: { type: Number, default: 0 }
})

const emit = defineEmits(['select'])

const isOpen = ref(props.level === 0)

import { watch } from 'vue'

watch(
  () => props.item.isExpanded,
  (expanded) => {
    if (expanded) {
      isOpen.value = true
    }
  },
  { immediate: true }
)

const isSelected = computed(() => props.item.key === props.selectedNode)

function toggleOrSelect() {
  emit('select', props.item)
  if (props.item.children?.length) {
    isOpen.value = !isOpen.value
  }
}

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.tree-node {
  width: 100%;
}

.node-content {
  height: 38px;
  padding-left: 1rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: #e2e8f0;
}

.node-content:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.node-content.selected {
  background-color: var(--color-primary); /* Bright blue selected state */
  color: white;
}

.node-icon img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.node-text {
  font-size: 0.95rem;
}

.fw-bold {
  font-weight: 600;
}

.node-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.node-action:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.vertical-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #36375e; /* Connecting line color */
}
</style>
