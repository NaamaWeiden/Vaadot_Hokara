import apiClient from './apiClient'
import type { CandidateGroup } from '@/types/candidates'

import mockData from '@/mock/candidates.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// TODO: replace CandidateGroupSet (and its $expand) with the real EntitySet once the service exists
export const getCandidateGroups = async (): Promise<CandidateGroup[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockData as CandidateGroup[]), 500))
  }

  try {
    const response = await apiClient.get('/CandidateGroupSet', {
      params: {
        $expand: 'candidates/notes'
      }
    })
    return response.data as CandidateGroup[]
  } catch (error) {
    console.error('Failed to fetch CandidateGroupSet from SAP.', error)
    throw error
  }
}
