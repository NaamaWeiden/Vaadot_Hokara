<template>
  <div class="h-100">
    <v-navigation-drawer permanent location="right" :width="sidebarWidth">
      <right-sidebar
        @select-committee="selectedCommittee = $event"
        @create-committee="openCommitteePopup(null)"
      />
    </v-navigation-drawer>

    <v-main>
      <div class="page-content d-flex flex-column ga-3">
        <CommitteeHeader
          v-if="selectedCommittee"
          :committee="selectedCommittee"
          @edit="openCommitteePopup(selectedCommittee)"
        />
        <CandidatesTable
          class="flex-1-1-0"
          :groups="candidatesStore.groups"
          :loading="candidatesStore.isLoading"
          :committee-key="selectedCommittee?.key"
          @move-candidate="moveCandidate"
        />
      </div>
    </v-main>

    <CommitteeFormPopup
      v-model="isCommitteePopupOpen"
      :committee="editedCommittee"
      :saving="committeesStore.isSaving"
      @save="saveCommittee"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import RightSidebar from '@/components/RightSidebar.vue'
import CandidatesTable from '@/components/CandidatesTable.vue'
import CommitteeHeader from '@/components/CommitteeHeader.vue'
import CommitteeFormPopup from '@/components/CommitteeFormPopup.vue'
import { CANDIDATE_STATUSES, useCandidatesStore } from '@/stores/candidatesStore'
import { useCommitteesStore } from '@/stores/committeesStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Committee, CommitteeForm } from '@/types/treeTypes'

const { width } = useDisplay()
const { t } = useI18n()
const candidatesStore = useCandidatesStore()
const committeesStore = useCommitteesStore()
const notification = useNotificationStore()

const selectedCommittee = ref<Committee | null>(null)

const isCommitteePopupOpen = ref(false)
// The committee being edited in the popup; null = creating a new committee
const editedCommittee = ref<Committee | null>(null)

function openCommitteePopup(committee: Committee | null) {
  editedCommittee.value = committee
  isCommitteePopupOpen.value = true
}

// Sends the committee to the server (the same call for a new committee and an edited one).
// On an error the store already shows the server's message and the popup stays open.
async function saveCommittee(form: CommitteeForm) {
  const isNew = !editedCommittee.value
  // An empty key tells the server this is a new committee
  const committee: Committee = {
    ...editedCommittee.value,
    key: editedCommittee.value?.key ?? '',
    ...form,
  }

  const saved = await committeesStore.save(committee)
  if (!saved) return

  isCommitteePopupOpen.value = false
  if (isNew) {
    // TODO: add the new committee to the sidebar tree once the tree comes from the server
    notification.success(t('notifications.committeeCreated', { name: saved.name }))
  } else {
    selectedCommittee.value = saved
    notification.success(t('notifications.committeeUpdated', { name: saved.name }))
  }
}

// After a move (by drag or by the row menu) a success message offers to undo it
function moveCandidate(pernr: string, toStatus: string) {
  const candidate = candidatesStore.candidates.find((c) => c.pernr === pernr)
  const target = CANDIDATE_STATUSES.find((status) => status.id === toStatus)

  const fromStatus = candidatesStore.moveCandidate(pernr, toStatus)
  if (!fromStatus || !candidate || !target) return

  notification.success(
    t('candidates.undo.message', { name: candidate.name, status: t(target.titleKey) }),
    {
      text: t('candidates.undo.action'),
      // Puts the candidate back in the status it came from
      onClick: () => candidatesStore.moveCandidate(pernr, fromStatus),
    }
  )
}

// TODO: later, load the candidates of the committee selected in the sidebar
onMounted(() => {
  candidatesStore.loadCandidates()
})

// Determine responsive width (15vw, constrained to reasonable min/max)
// This ensures Vuetify's v-main layout logic correctly pads the main content
const sidebarWidth = computed(() => {
  return Math.max(250, Math.min(width.value * 0.15, 300))
})
</script>

<style scoped>
/* Vuetify natively handles v-main and v-navigation-drawer layout */
.v-main {
  height: 100%;
}

.page-content {
  height: 100vh;
  padding: 1rem;
  background: var(--color-bg-light);
}
</style>
