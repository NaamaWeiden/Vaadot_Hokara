import { defineStore } from 'pinia'
import { saveCommittee } from '@/DL/committees'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Committee } from '@/types/treeTypes'

export const useCommitteesStore = defineStore('committees', {
  state: () => ({
    isSaving: false as boolean,
  }),

  actions: {
    // Creates or updates a committee on the server.
    // Returns the saved committee, or null when the save failed (the error message is already shown).
    async save(committee: Committee): Promise<Committee | null> {
      this.isSaving = true
      try {
        return await saveCommittee(committee)
      } catch (err) {
        console.error('Failed to save committee', err)
        useNotificationStore().error(err)
        return null
      } finally {
        this.isSaving = false
      }
    },
  },
})
