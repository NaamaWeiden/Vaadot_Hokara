import apiClient from './apiClient'
import type { AvailableCandidate, Candidate } from '@/types/candidates'

import mockCandidates from '@/mock/candidates.json'
import mockAvailableCandidates from '@/mock/availableCandidates.json'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// OData string literals escape a single quote by doubling it
const toODataString = (value: string) => `'${value.replace(/'/g, "''")}'`

// All the committee's candidates in one flat list - each one has its own status
// TODO: replace CommitteeCandidateSet with the real EntitySet once the service exists
export const getCommitteeCandidates = async (): Promise<Candidate[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockCandidates as Candidate[]), 500))
  }

  try {
    const response = await apiClient.get('/CommitteeCandidateSet', {
      params: {
        $expand: 'notes'
      }
    })
    return response.data as Candidate[]
  } catch (error) {
    console.error('Failed to fetch CommitteeCandidateSet from SAP.', error)
    throw error
  }
}

// Candidates that can still be added to the committee, filtered on the server by searchTerm
// (a pernr or a name - the server decides which one it is).
// TODO: replace AvailableCandidateSet and the $filter field names with the real ones once the service exists
export const getAvailableCandidates = async (
  committeeKey: string,
  searchTerm: string
): Promise<AvailableCandidate[]> => {
  if (USE_MOCK) {
    // Simulates the server-side search on the mock list
    const term = searchTerm.toLowerCase()
    const pernrTerm = searchTerm.replace(/\s/g, '')
    const result = (mockAvailableCandidates as AvailableCandidate[]).filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(term) || candidate.pernr.includes(pernrTerm)
    )
    return new Promise((resolve) => setTimeout(() => resolve(result), 500))
  }

  try {
    const response = await apiClient.get('/AvailableCandidateSet', {
      params: {
        $filter: `CommitteeKey eq ${toODataString(committeeKey)} and SearchTerm eq ${toODataString(searchTerm)}`
      }
    })
    return response.data as AvailableCandidate[]
  } catch (error) {
    console.error('Failed to fetch AvailableCandidateSet from SAP.', error)
    throw error
  }
}
