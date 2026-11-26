<template>
  <div class="right-sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="header-row d-flex align-center w-100 px-4 py-4">
        <img src="@/assets/alligator-logo.png" class="logo" />
        <span class="header-subtitle">{{ t('sidebar.subtitle') }}</span>
        <span class="header-title">{{ t('system-name') }}</span>
      </div>
      <div class="divider"></div>
    </div>

    <div class="details-panel">
      <Btn
        :text="t('sidebar.createCommittee')"
        icon="mdi-plus-box-outline"
        :isPrimary="true"
        @clicked="emit('create-committee')"
      />
      <!-- Hidden for now - change v-if to true to show quota management again -->
      <Btn
        v-if="false"
        :text="t('sidebar.manageQuotas')"
        icon="mdi-database-cog-outline"
        :isPrimary="true"
      />
    </div>

    <v-divider />

    <!-- Search -->
    <div class="px-4 py-4">
      <v-text-field
        v-model="search"
        :placeholder="t('sidebar.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        variant="solo"
        bg-color="#282A46"
        class="search-bar-input rounded-lg"
        dir="rtl"
      />
    </div>

    <!-- Tree -->
    <div class="tree-container pb-4">
      <resource-tree :search="search" @select-committee="emit('select-committee', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ResourceTree from './ResourceTree.vue'
import Btn from './Btn.vue'
import type { Committee } from '@/types/treeTypes'

const emit = defineEmits<{
  (e: 'select-committee', committee: Committee | null): void
  (e: 'create-committee'): void
}>()

const { t } = useI18n()
const search = ref('')
</script>

<style scoped>
.right-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #20213b;
  color: white;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
}

.header-row {
  gap: 0.5rem;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.8rem;
  color: #a0a3c9;
  line-height: 1.2;
}

.logo {
  height: 28px;
  width: auto;
}

.divider {
  height: 1px;
  background-color: #36375e;
}

.details-panel {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0.75rem;
}

/* Buttons keep their natural width and the row is centered */
.details-panel > .btn {
  flex: 0 0 auto;
  justify-content: center;
  padding-inline: var(--spacing-sm);
}

.search-bar-input :deep(.v-field) {
  border-radius: 6px;
  box-shadow: none !important;
}

.search-bar-input :deep(.v-field__input) {
  color: #a0a3c9;
  font-size: 0.9rem;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
}
</style>
