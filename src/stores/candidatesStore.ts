import { defineStore } from 'pinia'
import { getCandidateGroups } from '@/DL/candidates'
import type { CandidateGroup } from '@/types/candidates'

export interface CandidateMoveSource {
  fromGroupId: string
  fromIndex: number
}

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    groups: [] as CandidateGroup[],
    isLoading: false as boolean,
  }),

  actions: {
    async loadCandidates() {
      if (this.isLoading) return

      this.isLoading = true
      try {
        this.groups = await getCandidateGroups()
      } catch (err) {
        console.error('Failed to load candidates from server', err)
      } finally {
        this.isLoading = false
      }
    },

    // Moves a candidate from one group (status) to another. Returns where it came from, so the move can be undone.
    // Returns null when nothing moved (unknown group, candidate not in the source group, or same group).
    // TODO: call the server once the service exists - for now the change is kept in memory only
    moveCandidate(
      pernr: string,
      fromGroupId: string,
      toGroupId: string,
      toIndex = 0
    ): CandidateMoveSource | null {
      if (fromGroupId === toGroupId) return null
      const fromGroup = this.groups.find((group) => group.id === fromGroupId)
      const toGroup = this.groups.find((group) => group.id === toGroupId)
      if (!fromGroup || !toGroup) return null

      const fromIndex = fromGroup.candidates.findIndex((candidate) => candidate.pernr === pernr)
      if (fromIndex === -1) return null
      const [candidate] = fromGroup.candidates.splice(fromIndex, 1)
      if (!candidate) return null
      const index = Math.min(Math.max(toIndex, 0), toGroup.candidates.length)
      toGroup.candidates.splice(index, 0, candidate)

      return { fromGroupId, fromIndex }
    },
  },
})
