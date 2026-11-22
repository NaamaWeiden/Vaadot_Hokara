<template>
  <div class="committee-header d-flex flex-column ga-1 py-2 px-4 rounded-lg">
    <h1 class="committee-header__title">{{ committee.name }}</h1>

    <div class="d-flex align-center ga-2">
      <div class="committee-header__meta d-flex align-center ga-2">
        <span class="d-flex ga-1">
          <span>{{ startDate }}</span>
          <span>-</span>
          <span>{{ endDate }}</span>
        </span>
        <template v-if="committee.unit">
          <span class="committee-header__separator">|</span>
          <span>{{ committee.unit }}</span>
        </template>
      </div>

      <div class="d-flex ga-1">
        <button
          type="button"
          class="committee-header__action d-flex align-center justify-center rounded"
          :title="t('committee.link')"
          :aria-label="t('committee.link')"
          @click="emit('link')"
        >
          <v-icon size="14">mdi-link-variant</v-icon>
        </button>
        <button
          type="button"
          class="committee-header__action d-flex align-center justify-center rounded"
          :title="t('committee.edit')"
          :aria-label="t('committee.edit')"
          @click="emit('edit')"
        >
          <v-icon size="14">mdi-square-edit-outline</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Committee } from '@/types/treeTypes'

defineProps<{
  committee: Committee
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'link'): void
}>()

const { t } = useI18n()

// TODO: design placeholders - replace with the committee's real dates once they come from the server
const startDate = '02/01/26'
const endDate = '20/03/26'
</script>

<style scoped>
.committee-header {
  width: fit-content;
  background: #20213b;
  color: var(--color-white);
}

.committee-header__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  line-height: 1.3;
}

.committee-header__meta {
  font-size: var(--font-size-xs);
  color: #a0a3c9;
}

.committee-header__separator {
  color: #5c5f86;
}

.committee-header__action {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  cursor: pointer;
  background: var(--color-primary);
  color: var(--color-white);
  transition: background-color 0.2s;
}

.committee-header__action:hover {
  background: var(--color-primary-hover);
}
</style>
