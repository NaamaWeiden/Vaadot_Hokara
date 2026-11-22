<template>
  <!-- display: contents - the header sticks across the whole groups list, not only inside its own group -->
  <div class="candidate-group">
    <div
      class="group-header-wrap d-flex align-center"
      :style="{ '--group-index': index, '--group-count': count }"
    >
      <button
        type="button"
        class="group-header d-flex align-center ga-1 w-100 py-1 px-3 rounded"
        :data-status="group.id"
        @click="emit('select')"
      >
        <span class="group-header__title font-weight-bold">{{ group.title }}</span>
        <span>({{ group.candidates.length }})</span>
        <span v-if="group.totalAmount !== undefined">
          ( {{ formatAmount(group.totalAmount) }} )
        </span>
      </button>
    </div>

    <div class="d-flex flex-column ga-2 pt-1 pb-3" :data-group-body="group.id">
      <CandidateRow
        v-for="candidate in group.candidates"
        :key="candidate.pernr"
        :candidate="candidate"
      />
      <div v-if="group.candidates.length === 0" class="group-empty py-2 px-3">
        {{ t('candidates.emptyGroup') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { CandidateGroup } from '@/types/candidates'
import { formatAmount } from '@/utils/candidates.utils'
import CandidateRow from './CandidateRow.vue'

defineProps<{
  group: CandidateGroup
  // Position of the group in the list and the number of groups - used for the sticky offsets
  index: number
  count: number
}>()

const emit = defineEmits<{
  select: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.candidate-group {
  display: contents;
}

/*
 * Sticky stack: headers above the viewport dock under the column headers (one under the other),
 * headers below the viewport wait stacked at the bottom.
 * The opaque background hides the rows that scroll underneath.
 */
.group-header-wrap {
  position: sticky;
  top: calc(var(--columns-height, 0px) + var(--group-index) * var(--group-header-height));
  bottom: calc((var(--group-count) - var(--group-index) - 1) * var(--group-header-height));
  z-index: 1;
  height: var(--group-header-height);
  min-width: max-content;
  background: var(--color-bg-lighter);
}

.group-header {
  min-width: max-content;
  border: none;
  background: var(--color-border-lighter);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: filter 0.15s;
}

.group-header:hover {
  filter: brightness(0.96);
}

.group-header__title {
  color: var(--color-text-main);
}

.group-empty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
