import { defineStore } from 'pinia'
import { getAvailableCandidates, getCandidateGroups } from '@/DL/candidates'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Candidate, CandidateGroup } from '@/types/candidates'

export interface CandidateMoveSource {
  fromGroupId: string
  fromIndex: number
}

// The group a candidate added to the committee goes into
const ADD_TO_COMMITTEE_GROUP_ID = 'planning'

// Id of the latest search for candidates to add - an older response that arrives late is ignored
let availableSearchId = 0

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    groups: [] as CandidateGroup[],
    isLoading: false as boolean,
    // Search results of the "add to committee" menu
    availableCandidates: [] as Candidate[],
    // The term availableCandidates belong to - set when a response arrives (null = no search yet)
    availableSearchTerm: null as string | null,
  }),

  actions: {
    async loadCandidates() {
      if (this.isLoading) return

      this.isLoading = true
      try {
        this.groups = await getCandidateGroups()
      } catch (err) {
        console.error('Failed to load candidates from server', err)
        useNotificationStore().error(err)
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

    async searchAvailableCandidates(committeeKey: string, searchTerm: string) {
      const searchId = ++availableSearchId
      try {
        const candidates = await getAvailableCandidates(committeeKey, searchTerm)
        if (searchId !== availableSearchId) return

        this.availableCandidates = candidates
        this.availableSearchTerm = searchTerm
      } catch (err) {
        if (searchId !== availableSearchId) return
        this.availableCandidates = []
        this.availableSearchTerm = searchTerm
        console.error('Failed to search candidates to add to the committee', err)
        useNotificationStore().error(err)
      }
    },

    clearAvailableCandidates() {
      // Also drops the response of a search that is still running
      availableSearchId++
      this.availableCandidates = []
      this.availableSearchTerm = null
    },

    // TODO: call the server once the service exists - for now the change is kept in memory only
    addCandidateToCommittee(candidate: Candidate): boolean {
      const group = this.groups.find((g) => g.id === ADD_TO_COMMITTEE_GROUP_ID)
      if (!group) return false

      const alreadyInCommittee = this.groups.some((g) =>
        g.candidates.some((c) => c.pernr === candidate.pernr)
      )
      if (!alreadyInCommittee) group.candidates.unshift(candidate)

      this.availableCandidates = this.availableCandidates.filter((c) => c.pernr !== candidate.pernr)
      return !alreadyInCommittee
    },
  },
})
