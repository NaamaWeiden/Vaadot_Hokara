import apiClient from './apiClient'
import type { ExampleItem } from '@/types/exampleTypes'

import mockData from '@/mock/example.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// TODO: example - replace ExampleSet with the real EntitySet name
export const getExampleItems = async (): Promise<ExampleItem[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockData as ExampleItem[]), 500))
  }

  try {
    const response = await apiClient.get('/ExampleSet')
    return response.data as ExampleItem[]
  } catch (error) {
    console.error('Failed to fetch ExampleSet from SAP.', error)
    throw error
  }
}
