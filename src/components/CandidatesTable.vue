<template>
  <div
    class="candidates-table d-flex flex-column h-100 position-relative overflow-hidden rounded-lg"
    :style="{ '--candidates-columns': gridColumns }"
  >
    <LoaderOverlay :visible="loading" />

    <!-- Top bar: actions + search (fixed, does not scroll) -->
    <div class="d-flex align-center justify-space-between ga-4 py-3 px-4 flex-shrink-0">
      <div class="d-flex ga-2">
        <Btn :text="t('candidates.addToCommittee')" icon="mdi-account-plus-outline" />
        <Btn :text="t('candidates.loadFromExcel')" icon="mdi-tray-arrow-up" />
      </div>

      <v-text-field
        v-model="search"
        class="ct-search"
        :placeholder="t('candidates.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
      />
    </div>

    <!-- Scrollable area -->
    <div
      ref="scrollEl"
      class="ct-scroll flex-1-1-0 overflow-auto"
      :style="{ '--columns-height': `${columnsHeight}px` }"
    >
      <!-- Column headers: sticky inside the scrollable area -->
      <div ref="columnsEl" class="ct-columns position-sticky top-0 py-2 px-6">
        <div
          v-for="column in columns"
          :key="column.value"
          class="d-flex align-center px-2"
          :class="column.value === 'name' ? 'justify-start' : 'justify-center'"
        >
          <ColumnFilterMenu
            :header="column"
            :value-options="getValueOptions(column)"
            :sort-field="sortBy"
            :sort-desc="sortDesc"
            :selected-values="columnFilters[column.value] ?? null"
            @sort="setSort"
            @filter="setFilter"
          />
        </div>
        <div class="ct-plain-header d-flex align-center px-2">
          {{ t('candidates.columns.notes') }}
        </div>
        <div />
      </div>

      <!-- Group headers are always shown, even when a group is empty or fully filtered out -->
      <div v-if="!loading && visibleGroups.length === 0" class="d-flex justify-center py-12 px-4">
        <NoContent />
      </div>
      <div v-else class="ct-groups d-flex flex-column pt-2 px-4 pb-1">
        <CandidateGroup
          v-for="(group, index) in visibleGroups"
          :key="group.id"
          :group="group"
          :index="index"
          :count="visibleGroups.length"
          @select="scrollToGroup(index)"
          @move-candidate="
            (pernr, fromGroupId, toGroupId) =>
              emit('moveCandidate', pernr, fromGroupId, toGroupId)
          "
        />
      </div>
    </div>

    <!--
      Floating card of the dragged candidate. It is rendered inside the table (not teleported)
      so it keeps --candidates-columns; position: fixed lets it follow the cursor over the whole page.
    -->
    <div
      v-if="drag.candidate"
      class="drag-card"
      :style="{
        width: `${drag.width}px`,
        transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)`,
      }"
    >
      <CandidateRow
        class="drag-card__row"
        :candidate="drag.candidate"
        :group-id="drag.fromGroupId ?? ''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize } from '@vueuse/core'
import type { CandidateGroup as CandidateGroupType } from '@/types/candidates'
import type { TableHeader } from '@/types/table'
import { useCandidatesTable } from '@/composables/useCandidatesTable'
import { useCandidateDrag } from '@/composables/useCandidateDrag'
import Btn from './Btn.vue'
import ColumnFilterMenu from './ColumnFilterMenu.vue'
import CandidateGroup from './CandidateGroup.vue'
import CandidateRow from './CandidateRow.vue'
import LoaderOverlay from './LoaderOverlay.vue'
import NoContent from './NoContent.vue'

const props = defineProps<{
  groups: CandidateGroupType[]
  loading: boolean
}>()

const emit = defineEmits<{
  moveCandidate: [pernr: string, fromGroupId: string, toGroupId: string]
}>()

const { t } = useI18n()
const { drag } = useCandidateDrag()

// The sticky group headers dock right under the column headers, so their height is needed
const columnsEl = ref<HTMLElement | null>(null)
const { height: columnsHeight } = useElementSize(columnsEl, undefined, { box: 'border-box' })

const scrollEl = ref<HTMLElement | null>(null)

// Scrolls so the group's header docks at its place in the top stack and its rows show right under it
function scrollToGroup(index: number) {
  const container = scrollEl.value
  const group = visibleGroups.value[index]
  if (!container || !group) return

  const body = container.querySelector<HTMLElement>(`[data-group-body="${CSS.escape(group.id)}"]`)
  const headerHeight = (body?.previousElementSibling as HTMLElement | null)?.offsetHeight
  if (!body || headerHeight === undefined) return

  // The rows container is not sticky, so its position is the real position in the scroll content
  const bodyTop =
    body.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  const top = bodyTop - columnsHeight.value - (index + 1) * headerHeight
  container.scrollTo({ top, behavior: 'smooth' })
}

// Column widths, in RTL order: name | unit | rank | age | tatash | notes | menu
const gridColumns = '12rem 8rem 5rem 4rem 7rem minmax(14rem, 1fr) 2.5rem'

// Sortable/filterable columns (notes and the menu column are not)
const columns = computed<TableHeader[]>(() => [
  { value: 'name', text: t('candidates.columns.name'), type: 'S' },
  { value: 'unit', text: t('candidates.columns.unit'), type: 'S' },
  { value: 'rank', text: t('candidates.columns.rank'), type: 'S' },
  { value: 'age', text: t('candidates.columns.age'), type: 'N' },
  { value: 'tatash', text: t('candidates.columns.tatash'), type: 'D' },
])

const {
  search,
  sortBy,
  sortDesc,
  columnFilters,
  visibleGroups,
  getValueOptions,
  setSort,
  setFilter,
} = useCandidatesTable(() => props.groups, columns)
</script>

<style scoped>
.candidates-table {
  background: var(--color-white);
  border: 1px solid var(--color-border-main);
}

.ct-search {
  flex: 0 0 17rem;
}

/* Lets the scrollable area shrink inside the column flex layout, so it scrolls */
.ct-scroll {
  min-height: 0;
  /* Height of one sticky group header (CandidateGroup) */
  --group-header-height: 2.35rem;
}

.ct-columns {
  display: grid;
  grid-template-columns: var(--candidates-columns);
  min-width: max-content;
  z-index: 2;
  background: var(--color-white);
  border-top: 1px solid var(--color-border-main);
  border-bottom: 1px solid var(--color-border-main);
}

/* Same look as the ColumnFilterMenu header label */
.ct-plain-header {
  font-size: 0.78rem;
  font-weight: 500;
  color: #94a3b8;
}

.ct-groups {
  min-width: max-content;
  background: var(--color-bg-lighter);
}

/* ── Floating drag card ──────────────────────────────── */
.drag-card {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
  /* Lets elementFromPoint see the drop zone under the card */
  pointer-events: none;
}

/* Lift effect: the row grows a bit and gets a deep shadow, like it was picked off the table */
.drag-card .drag-card__row {
  transform: scale(1.02) rotate(-0.6deg);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.22);
  animation: drag-card-lift 0.15s ease-out;
}

@keyframes drag-card-lift {
  from {
    transform: none;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }
}
</style>

<style>
/* Grabbing cursor on the whole page while a candidate is dragged (class set by useCandidateDrag) */
body.candidate-dragging,
body.candidate-dragging * {
  cursor: grabbing !important;
}
</style>
