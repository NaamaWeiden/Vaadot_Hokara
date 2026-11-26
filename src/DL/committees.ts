import apiClient from './apiClient'
import type { Committee } from '@/types/treeTypes'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Creates or updates a committee - the server decides by the key: an empty key = a new committee.
// Returns the committee as the server saved it (a new committee comes back with its new key).
// TODO: replace CommitteeSet and the field names with the real ones once the service exists,
// and check the format the server expects for the lists (managers, viewers, displayColumns) and the dates.
export const saveCommittee = async (committee: Committee): Promise<Committee> => {
  if (USE_MOCK) {
    // Simulates the server: a new committee gets a key
    return new Promise((resolve) =>
      setTimeout(() => resolve({ ...committee, key: committee.key || `mock-${Date.now()}` }), 500)
    )
  }

  try {
    const response = await apiClient.post('/CommitteeSet', committee)
    // apiClient returns the body as an array. With no body, the committee that was sent is kept.
    return (response.data as Committee[])[0] ?? committee
  } catch (error) {
    console.error('Failed to save committee in SAP.', error)
    throw error
  }
}
