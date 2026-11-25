<template>
  <div
    class="candidates-table d-flex flex-column h-100 position-relative overflow-hidden rounded-lg"
    :style="{ '--candidates-columns': gridColumns }"
  >
    <LoaderOverlay :visible="loading" />

    <!-- Top bar: actions + search (fixed, does not scroll) -->
    <div class="d-flex align-center justify-space-between ga-4 py-3 px-4 flex-shrink-0">
      <div class="d-flex ga-2">
        <AddToCommitteeMenu :committee-key="committeeKey" />
        <Btn :text="t('candidates.loadFromExcel')" icon="mdi-tray-arrow-up" />
      </div>

      <v-text-field
        ref="searchField"
        v-model="search"
        v-model:focused="searchFocused"
        class="ct-search"
        :placeholder="t('candidates.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
      />

      <!--
        Search suggestions under the field. Opening/closing is fully controlled by showSuggestions:
        the menu is only positioned by the field (target, no activator), and the empty
        update:model-value handler ignores the menu's own close attempts (click outside, Escape).
        capture-focus=false keeps the focus in the field while typing.
      -->
      <v-menu
        :model-value="showSuggestions"
        :target="searchField?.$el"
        :capture-focus="false"
        location="bottom"
        offset="4"
        @update:model-value="() => {}"
      >
        <v-list class="ct-suggestions" dir="rtl" density="compact">
          <!-- mousedown.prevent: keeps the focus in the field, so the menu does not close before the click -->
          <v-list-item
            v-for="candidate in suggestions"
            :key="candidate.pernr"
            @mousedown.prevent
            @click="selectSuggestion(candidate)"
          >
            <template #prepend>
              <v-avatar size="32">
                <v-img
                  v-if="candidate.avatar && !failedAvatars.has(candidate.pernr)"
                  :src="candidate.avatar"
                  alt=""
                  @error="failedAvatars.add(candidate.pernr)"
                />
                <v-icon v-else size="32" color="blue-lighten-4">mdi-account-circle</v-icon>
              </v-avatar>
            </template>
            <div class="d-flex align-baseline ga-2">
              <span class="ct-suggestion-name font-weight-bold">{{ candidate.name }}</span>
              <span class="ct-suggestion-meta">{{ candidate.pernr }}</span>
            </div>
            <div class="ct-suggestion-meta">{{ getCandidateValue(candidate, 'rank') }}</div>
          </v-list-item>
        </v-list>
      </v-menu>
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
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize } from '@vueuse/core'
import type { VTextField } from 'vuetify/components'
import type { Candidate, CandidateGroup as CandidateGroupType } from '@/types/candidates'
import type { TableHeader } from '@/types/table'
import { useCandidatesTable } from '@/composables/useCandidatesTable'
import { getCandidateValue } from '@/utils/candidates.utils'
import { useCandidateDrag } from '@/composables/useCandidateDrag'
import Btn from './Btn.vue'
import AddToCommitteeMenu from './AddToCommitteeMenu.vue'
import ColumnFilterMenu from './ColumnFilterMenu.vue'
import CandidateGroup from './CandidateGroup.vue'
import CandidateRow from './CandidateRow.vue'
import LoaderOverlay from './LoaderOverlay.vue'
import NoContent from './NoContent.vue'

const props = defineProps<{
  groups: CandidateGroupType[]
  loading: boolean
  // The committee selected in the sidebar (undefined while none is selected)
  committeeKey?: string
}>()

const emit = defineEmits<{
  moveCandidate: [pernr: string, fromGroupId: string, toGroupId: string]
  select: [candidate: Candidate]
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
  suggestions,
  getValueOptions,
  setSort,
  setFilter,
} = useCandidatesTable(() => props.groups, columns)

const searchField = ref<VTextField | null>(null)
const searchFocused = ref(false)

// suggestions is already empty while the field is empty
const showSuggestions = computed(() => searchFocused.value && suggestions.value.length > 0)

// pernrs whose avatar failed to load - kept per row, so one broken image does not hide the others
const failedAvatars = reactive(new Set<string>())

// Puts the person's name in the search (so the table filters by it) and closes the suggestions
function selectSuggestion(candidate: Candidate) {
  search.value = candidate.name
  emit('select', candidate)
  searchField.value?.blur()
}
</script>

<style scoped>
.candidates-table {
  background: var(--color-white);
  border: 1px solid var(--color-border-main);
}

.ct-search {
  flex: 0 0 17rem;
}

/* Same look as the name cell in CandidateRow */
.ct-suggestion-name {
  font-size: var(--font-size-base);
  color: var(--color-text-main);
}

.ct-suggestion-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
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
