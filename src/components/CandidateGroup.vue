<template>
  <!-- display: contents - the header sticks across the whole groups list, not only inside its own group -->
  <!-- data-drop-group: the header and the rows area are both a drop zone for a dragged candidate -->
  <div
    class="candidate-group"
    :class="{ 'is-drop-target': isDropTarget }"
    :data-drop-group="group.id"
  >
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

    <div class="group-body d-flex flex-column ga-2 pt-1 pb-3" :data-group-body="group.id">
      <CandidateRow
        v-for="candidate in group.candidates"
        :key="candidate.pernr"
        :candidate="candidate"
        :group-id="group.id"
        :class="{ 'is-drag-source': drag.candidate?.pernr === candidate.pernr }"
        @move-candidate="
          (toGroupId) => emit('moveCandidate', candidate.pernr, group.id, toGroupId)
        "
      />
      <div v-if="group.candidates.length === 0" class="group-empty py-2 px-3">
        {{ t('candidates.emptyGroup') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CandidateGroup } from '@/types/candidates'
import { formatAmount } from '@/utils/candidates.utils'
import { useCandidateDrag } from '@/composables/useCandidateDrag'
import CandidateRow from './CandidateRow.vue'

const props = defineProps<{
  group: CandidateGroup
  // Position of the group in the list and the number of groups - used for the sticky offsets
  index: number
  count: number
}>()

const emit = defineEmits<{
  select: []
  moveCandidate: [pernr: string, fromGroupId: string, toGroupId: string]
}>()

const { t } = useI18n()
const { drag } = useCandidateDrag()

// The dragged candidate will move to this status when the mouse is released
const isDropTarget = computed(() => drag.targetGroupId === props.group.id)
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
  height: calc(100% - 0.5rem);
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

/* Positioned, so the drop-target frame (::after) can cover the rows area */
.group-body {
  position: relative;
}

/*
 * Drop target: a frame around the header and all its rows.
 * The group root is display: contents and has no box of its own, so the frame is drawn in two parts
 * that meet: top + sides on the header, sides + bottom on the rows area.
 * It is drawn in ::after (on top of the rows) so the full-width rows do not hide its sides.
 */
.is-drop-target > .group-header-wrap,
.is-drop-target > .group-body {
  background: var(--color-primary-light);
}

.is-drop-target > .group-header-wrap::after,
.is-drop-target > .group-body::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-primary);
  pointer-events: none;
}

.is-drop-target > .group-header-wrap::after {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.is-drop-target > .group-body::after {
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.is-drop-target .group-header {
  background: var(--color-primary-light-hover);
  color: var(--color-primary);
}

.is-drop-target .group-header__title {
  color: var(--color-primary);
}

.group-empty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
