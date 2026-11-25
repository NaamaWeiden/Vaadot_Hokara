import { defineStore } from 'pinia'
import { getAvailableCandidates, getCommitteeCandidates } from '@/DL/candidates'
import { useNotificationStore } from '@/stores/notificationStore'
import type {
  AvailableCandidate,
  Candidate,
  CandidateGroup,
  CandidateStatus,
} from '@/types/candidates'

// The table groups, in display order. The server sends only each candidate's status, not the groups.
export const CANDIDATE_STATUSES: { id: CandidateStatus; titleKey: string }[] = [
  { id: 'summarized', titleKey: 'candidates.status.summarized' },
  { id: 'planning', titleKey: 'candidates.status.planning' },
  { id: 'rejected', titleKey: 'candidates.status.rejected' },
]

// The status of a candidate added to the committee
const ADD_TO_COMMITTEE_STATUS: CandidateStatus = 'planning'

// Id of the latest search for candidates to add - an older response that arrives late is ignored
let availableSearchId = 0

export const useCandidatesStore = defineStore('candidates', {
  state: () => ({
    // All the committee's candidates, as the server returns them (one flat list)
    candidates: [] as Candidate[],
    isLoading: false as boolean,
    // Search results of the "add to committee" menu
    availableCandidates: [] as AvailableCandidate[],
    // The term availableCandidates belong to - set when a response arrives (null = no search yet)
    availableSearchTerm: null as string | null,
  }),

  getters: {
    // One group per status, even when it has no candidates (the table always shows every group header)
    groups: (state): CandidateGroup[] =>
      CANDIDATE_STATUSES.map((status) => ({
        ...status,
        candidates: state.candidates.filter((candidate) => candidate.status === status.id),
      })),
  },

  actions: {
    async loadCandidates() {
      if (this.isLoading) return

      this.isLoading = true
      try {
        this.candidates = await getCommitteeCandidates()
      } catch (err) {
        console.error('Failed to load candidates from server', err)
        useNotificationStore().error(err)
      } finally {
        this.isLoading = false
      }
    },

    // Changes a candidate's status, which moves it to that status' group.
    // Returns the previous status, so the move can be undone.
    // Returns null when nothing changed (unknown candidate or status, or the same status).
    // TODO: call the server once the service exists - for now the change is kept in memory only
    moveCandidate(pernr: string, toStatus: string): CandidateStatus | null {
      // toStatus comes from the UI (drop zone / menu) as a plain string - accept only a known status
      const target = CANDIDATE_STATUSES.find((status) => status.id === toStatus)
      const candidate = this.candidates.find((c) => c.pernr === pernr)
      if (!target || !candidate || candidate.status === target.id) return null

      const fromStatus = candidate.status
      candidate.status = target.id
      return fromStatus
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
    addCandidateToCommittee(candidate: AvailableCandidate): boolean {
      const alreadyInCommittee = this.candidates.some((c) => c.pernr === candidate.pernr)
      if (!alreadyInCommittee) {
        this.candidates.unshift({ ...candidate, status: ADD_TO_COMMITTEE_STATUS })
      }

      this.availableCandidates = this.availableCandidates.filter((c) => c.pernr !== candidate.pernr)
      return !alreadyInCommittee
    },
  },
})
