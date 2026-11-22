import { defineStore } from 'pinia'
import { getExampleItems } from '@/DL/example'
import type { ExampleItem } from '@/types/exampleTypes'

export const useAppStore = defineStore('app', {
  state: () => ({
    exampleItems: [] as ExampleItem[],
    isLoadingInitialData: false as boolean,
    isUnauthorized: false as boolean,
  }),

  actions: {
    // TODO: replace getExampleItems with the first real call the app needs on load
    async loadInitialData() {
      if (this.isLoadingInitialData) return

      this.isLoadingInitialData = true
      try {
        this.exampleItems = await getExampleItems()
      } catch (err: any) {
        if (err?.response?.status === 403) {
          this.isUnauthorized = true
        }
        console.error('Failed to load initial data from server', err)
      } finally {
        this.isLoadingInitialData = false
      }
    },

    // Initialize on app load
    async initialize() {
      await this.loadInitialData()
    },
  },
})
