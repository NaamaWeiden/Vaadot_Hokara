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

    <!-- Undo bar after a candidate was moved (by drag or by the row menu). :key restarts the 5s timer on every move -->
    <v-snackbar
      :key="undoKey"
      v-model="undoVisible"
      :timeout="5000"
      location="bottom"
    >
      <template v-if="lastMove">
        {{ t('candidates.undo.message', { name: lastMove.name, status: lastMove.toTitle }) }}
      </template>
      <template #actions>
        <v-btn color="primary" variant="text" @click="undoMove">
          {{ t('candidates.undo.action') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import RightSidebar from '@/components/RightSidebar.vue'
import CandidatesTable from '@/components/CandidatesTable.vue'
import CommitteeHeader from '@/components/CommitteeHeader.vue'
import { useCandidatesStore } from '@/stores/candidatesStore'
import type { Committee } from '@/types/treeTypes'

interface LastMove {
  pernr: string
  name: string
  fromGroupId: string
  fromIndex: number
  toGroupId: string
  toTitle: string
}

const { width } = useDisplay()
const { t } = useI18n()
const candidatesStore = useCandidatesStore()

const selectedCommittee = ref<Committee | null>(null)

const lastMove = ref<LastMove | null>(null)
const undoVisible = ref(false)
const undoKey = ref(0)

function moveCandidate(pernr: string, fromGroupId: string, toGroupId: string) {
  const fromGroup = candidatesStore.groups.find((group) => group.id === fromGroupId)
  const toGroup = candidatesStore.groups.find((group) => group.id === toGroupId)
  const candidate = fromGroup?.candidates.find((c) => c.pernr === pernr)

  const source = candidatesStore.moveCandidate(pernr, fromGroupId, toGroupId)
  if (!source || !candidate || !toGroup) return

  lastMove.value = {
    pernr,
    name: candidate.name,
    fromGroupId: source.fromGroupId,
    fromIndex: source.fromIndex,
    toGroupId,
    toTitle: toGroup.title,
  }
  undoKey.value++
  undoVisible.value = true
}

// Moves the candidate back to the group and the position it came from
function undoMove() {
  const move = lastMove.value
  if (!move) return
  candidatesStore.moveCandidate(move.pernr, move.toGroupId, move.fromGroupId, move.fromIndex)
  lastMove.value = null
  undoVisible.value = false
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
