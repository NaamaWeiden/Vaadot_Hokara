<template>
  <div class="candidate-row rounded-lg">
    <div class="row-card pa-2"  @click="toggleNotes">
      <!-- Name: avatar + name + pernr (based on PopulationCell's name cell) -->
      <div class="cell d-flex align-center ga-3 px-2">
        <v-avatar size="36">
          <v-img v-if="candidate.avatar" :src="candidate.avatar" alt="" />
          <v-icon v-else size="36" color="blue-lighten-4">mdi-account-circle</v-icon>
        </v-avatar>
        <div class="overflow-hidden">
          <div class="employee-name font-weight-bold">{{ candidate.name }}</div>
          <div class="employee-meta">{{ candidate.pernr }}</div>
        </div>
      </div>

      <!-- Unit: long names are cut with "...", the full name is shown in a tooltip -->
      <div class="cell d-flex align-center justify-center px-2">
        <span class="text-truncate">
          {{ candidate.unit }}
          <v-tooltip activator="parent" location="top">{{ candidate.unit }}</v-tooltip>
        </span>
      </div>

      <div class="cell d-flex align-center justify-center px-2">{{ candidate.rank }}</div>
      <div class="cell d-flex align-center justify-center px-2">{{ candidate.age }}</div>
      <div class="cell d-flex align-center justify-center px-2">
        {{ formatDateString(candidate.tatash) }}
      </div>

      <!-- Notes: one note -> chip with the text, several notes -> chip with the count -->
      <div class="cell cell--notes d-flex align-center px-2">
        <v-chip
          v-if="candidate.notes.length"
          class="note-chip"
          variant="text"
          size="small"
          label
         
        >
          <span class="note-icon d-inline-flex align-center justify-center flex-shrink-0 rounded-sm me-2">
            <v-icon size="14">mdi-message-text-outline</v-icon>
          </span>
          <template v-if="singleNote">
            <span class="text-truncate">{{ singleNote.text }}</span>
            <span class="note-author flex-shrink-0 ms-1">({{ singleNote.author }})</span>
          </template>
          <span v-else>{{ candidate.notes.length }}</span>
        </v-chip>
      </div>

      <div class="cell cell--menu d-flex align-center justify-center">
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              density="comfortable"
            />
          </template>
          <!-- UI only for now: the items have no action yet -->
          <v-list density="compact">
            <v-list-item
              v-for="item in menuItems"
              :key="item.key"
              :prepend-icon="item.icon"
              :title="t(item.label)"
            />
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Notes panel: opens under the row when the notes chip is clicked -->
    <v-expand-transition>
      <div v-if="notesOpen" class="notes-panel d-flex pt-2 px-3 pb-3 rounded-b-lg">
        <div class="notes-card rounded-lg overflow-hidden">
          <div class="notes-card__title font-weight-bold py-1 px-3">
            {{ t('candidates.notes.title') }}
          </div>
          <div class="notes-card__list pa-2 ga-2">
            <div
              v-for="(note, index) in candidate.notes"
              :key="index"
              class="note-box rounded pa-2"
            >
              <span class="note-text">{{ note.text }}</span>
              <span class="note-author ms-1">({{ note.author }})</span>
            </div>
            <!-- UI only for now: typing here does not add a note -->
            <v-textarea
              class="note-input rounded"
              :placeholder="t('candidates.notes.placeholder')"
              variant="solo"
              flat
              bg-color="var(--color-bg-lighter)"
              density="compact"
              rows="2"
              rounded
              no-resize
              hide-details
            />
          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Candidate } from '@/types/candidates'
import { formatDateString } from '@/utils/dateUtils'

const props = defineProps<{
  candidate: Candidate
}>()

const { t } = useI18n()

const notesOpen = ref(false)

const singleNote = computed(() =>
  props.candidate.notes.length === 1 ? props.candidate.notes[0] : undefined
)

const menuItems = [
  { key: 'edit', icon: 'mdi-pencil-outline', label: 'candidates.menu.edit' },
  { key: 'summarize', icon: 'mdi-check-circle-outline', label: 'candidates.menu.moveToSummarized' },
  { key: 'remove', icon: 'mdi-account-remove-outline', label: 'candidates.menu.remove' },
]

function toggleNotes() {
  notesOpen.value = !notesOpen.value
}
</script>

<style scoped>
.candidate-row {
  min-width: max-content;
  background: var(--color-white);
  border: 1px solid var(--color-border-main);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.15s;
}

.candidate-row:hover {
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.07);
}

/* Same grid as the header row: --candidates-columns is defined once in CandidatesTable */
.row-card {
  display: grid;
  grid-template-columns: var(--candidates-columns);
  align-items: stretch;
}

.cell {
  min-width: 0;
  white-space: nowrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Vertical divider between cells (not before the menu column) */
.cell + .cell:not(.cell--menu) {
  border-inline-start: 1px solid var(--color-border-main);
}

/* Long note text must not widen the grid - it is truncated with ellipsis instead */
.cell--notes {
  contain: inline-size;
}

.employee-name {
  font-size: var(--font-size-base);
  color: var(--color-text-main);
}

.employee-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.note-chip {
  background: var(--color-bg-light);
  color: var(--color-text-secondary);
}

/* Lets the chip content shrink, so .text-truncate can cut the note text with "..." */
.note-chip :deep(.v-chip__content) {
  min-width: 0;
}

.note-author {
  color: var(--color-text-light);
}

.note-icon {
  width: 1.4rem;
  height: 1.2rem;
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-muted);
}

/* ── Notes panel ─────────────────────────────────────── */
.notes-panel {
  background: var(--color-bg-light);
  /* Long note text must not widen the row */
  contain: inline-size;
}

.notes-card {
  width: 70%;
  background: var(--color-white);
  border: 1px solid var(--color-border-lighter);
}

.notes-card__title {
  font-size: var(--font-size-xs);
  color: var(--color-text-main);
  background: var(--color-bg-lighter);
  border-bottom: 1px solid var(--color-border-main);
}

.notes-card__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.note-box,
.note-input {
  border: 1px solid var(--color-border-main);
}

.note-box {
  min-height: 3.5rem;
  font-size: var(--font-size-xs);
  line-height: 1.4;
  background: var(--color-bg-lighter);
}

.note-text {
  color: var(--color-text-secondary);
}

.note-input :deep(textarea) {
  font-size: var(--font-size-xs);
}
</style>
