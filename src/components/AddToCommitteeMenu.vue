<template>
  <v-menu
    v-model="open"
    :disabled="!committeeKey"
    :close-on-content-click="false"
    location="bottom start"
    offset="8"
    @after-enter="searchField?.focus()"
  >
    <template #activator="{ props: menuProps }">
      <Btn
        v-bind="menuProps"
        :text="t('candidates.addToCommittee')"
        icon="mdi-account-plus-outline"
        :disabled="!committeeKey"
      />
    </template>

    <div class="atc-menu d-flex flex-column ga-2" dir="rtl">
      <v-text-field
        ref="searchField"
        v-model="search"
        :placeholder="t('candidates.searchPlaceholder')"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="lg"
        bg-color="white"
        hide-details
      />

      <!-- Nothing is shown under the field until the term is long enough to search (see getCandidateSearchTerm) -->
      <div v-if="searchTerm" class="atc-results rounded-lg">
        <div v-if="isLoading" class="d-flex justify-center py-4">
          <v-progress-circular indeterminate size="28" width="3" color="primary" />
        </div>

        <div v-else-if="showNoResults" class="atc-empty py-4 px-3 text-center">
          {{ t('noResults') }}
        </div>

        <div v-else class="atc-list d-flex flex-column pa-1">
          <template v-for="(candidate, index) in candidatesStore.availableCandidates" :key="candidate.pernr">
            <!-- The whole row adds the candidate. The button has no handler of its own: its click bubbles here,
                 so it runs once, and it keeps the row reachable by keyboard (Tab + Enter/Space).
                 keydown.enter.stop keeps Enter away from v-menu, which would otherwise cancel it and close the menu -->
            <div
              class="atc-row d-flex align-center ga-2 pa-1 rounded-lg"
              @click="addCandidate(candidate)"
            >
              <v-avatar size="25">
                <v-img
                  v-if="candidate.avatar && !failedAvatars.has(candidate.pernr)"
                  :src="candidate.avatar"
                  alt=""
                  @error="failedAvatars.add(candidate.pernr)"
                />
                <v-icon v-else size="25" color="blue-lighten-4">mdi-account-circle</v-icon>
              </v-avatar>

              <div class="d-flex flex-column flex-1-1 overflow-hidden">
                <span class="atc-row__name text-truncate">{{ candidate.name }}</span>
                <span class="atc-row__pernr">{{ candidate.pernr }}</span>
              </div>

              <button
                type="button"
                class="atc-add d-flex flex-column align-center justify-center rounded-lg"
                :title="t('candidates.addCandidate')"
                @keydown.enter.stop
              >
                <v-icon size="16">mdi-account-plus-outline</v-icon>
                <span>{{ t('candidates.addCandidate') }}</span>
              </button>
            </div>
            <div v-if="index < candidatesStore.availableCandidates.length - 1" class="atc-divider" />
          </template>
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { watchDebounced } from '@vueuse/core'
import type { VTextField } from 'vuetify/components'
import { useCandidatesStore } from '@/stores/candidatesStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { getCandidateSearchTerm } from '@/utils/candidates.utils'
import type { Candidate } from '@/types/candidates'
import Btn from './Btn.vue'

const SEARCH_DEBOUNCE_MS = 300

const props = defineProps<{
  // The committee selected in the sidebar - the button is disabled while there is none
  committeeKey?: string
}>()

const { t } = useI18n()
const candidatesStore = useCandidatesStore()
const notification = useNotificationStore()

const open = ref(false)
const search = ref('')
const searchField = ref<VTextField | null>(null)

// null while the input is too short to search
const searchTerm = computed(() => getCandidateSearchTerm(search.value))

// From the moment the term is long enough until its results arrive (the debounce wait + the server call).
// The store sets availableSearchTerm only when a response arrives, so a different term means "not answered yet".
const isLoading = computed(
  () => !!searchTerm.value && candidatesStore.availableSearchTerm !== searchTerm.value
)

const showNoResults = computed(
  () => !isLoading.value && candidatesStore.availableCandidates.length === 0
)

// pernrs whose avatar failed to load - kept per row, so one broken image does not hide the others
const failedAvatars = reactive(new Set<string>())

// Below the threshold the results are cleared right away; above it the server is called once typing pauses
watch(searchTerm, (term) => {
  if (!term) candidatesStore.clearAvailableCandidates()
})

watchDebounced(
  searchTerm,
  (term) => {
    if (term && props.committeeKey) {
      candidatesStore.searchAvailableCandidates(props.committeeKey, term)
    }
  },
  { debounce: SEARCH_DEBOUNCE_MS }
)

// Every open starts with an empty search
watch(open, (isOpen) => {
  if (!isOpen) search.value = ''
})

// Closing the menu also resets the search (see the watch on open)
function addCandidate(candidate: Candidate) {
  if (candidatesStore.addCandidateToCommittee(candidate)) {
    notification.success(t('notifications.addedToCommittee', { name: candidate.name }))
  }
  open.value = false
}
</script>

<style scoped>
.atc-menu {
  width: 15rem;
}

.atc-results {
  background: var(--color-white);
  border: 1px solid var(--color-border-lighter);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.atc-list {
  max-height: 20rem;
  overflow-y: auto;
}

.atc-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.atc-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.atc-row:hover {
  background: var(--color-primary);
}

.atc-row__name {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-main);
}

.atc-row__pernr {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.atc-row:hover .atc-row__name,
.atc-row:hover .atc-row__pernr {
  color: var(--color-white);
}

.atc-divider {
  height: 1px;
  margin: 0 var(--spacing-sm);
  background: var(--color-border-lighter);
}

.atc-add {
  flex: 0 0 auto;
  gap: 0.125rem;
  padding: 0.20rem 0.33rem;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
  background: var(--color-primary-light);
  color: var(--color-primary);
  transition: background-color 0.2s;
}

.atc-add:hover {
  background: var(--color-primary-light-hover);
}
</style>
