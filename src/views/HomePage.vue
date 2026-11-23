<template>
  <div class="h-100">
    <v-navigation-drawer permanent location="right" :width="sidebarWidth">
      <right-sidebar @select-committee="selectedCommittee = $event" />
    </v-navigation-drawer>

    <v-main>
      <div class="page-content d-flex flex-column ga-3">
        <CommitteeHeader v-if="selectedCommittee" :committee="selectedCommittee" />
        <CandidatesTable
          class="flex-1-1-0"
          :groups="candidatesStore.groups"
          :loading="candidatesStore.isLoading"
          @move-candidate="moveCandidate"
        />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import RightSidebar from '@/components/RightSidebar.vue'
import CandidatesTable from '@/components/CandidatesTable.vue'
import CommitteeHeader from '@/components/CommitteeHeader.vue'
import { useCandidatesStore } from '@/stores/candidatesStore'
import type { Committee } from '@/types/treeTypes'

const { width } = useDisplay()
const candidatesStore = useCandidatesStore()

const selectedCommittee = ref<Committee | null>(null)

function moveCandidate(pernr: string, fromGroupId: string, toGroupId: string) {
  candidatesStore.moveCandidate(pernr, fromGroupId, toGroupId)
}

// TODO: later, load the candidates of the committee selected in the sidebar
onMounted(() => {
  candidatesStore.loadCandidates()
})

// Determine responsive width (e.g. 20vw, but constrained to reasonable min/max)
// This ensures Vuetify's v-main layout logic correctly pads the main content
const sidebarWidth = computed(() => {
  return Math.max(280, Math.min(width.value * 0.17, 340))
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
