// TODO: UI-stage types - align field names with the real OData $metadata once the service exists
export interface CandidateNote {
  text: string
  author: string
}

// TODO: align with the real status values the server returns
export type CandidateStatus = 'summarized' | 'planning' | 'rejected'

export interface Candidate {
  pernr: string
  name: string
  avatar: string
  unit: string
  rank: string
  age: number
  // Date as YYYYMMDD string (the format the existing SAP server uses for dates)
  tatash: string
  notes: CandidateNote[]
  // The status decides which group of the table the candidate is shown in
  status: CandidateStatus
}

// A candidate found in the "add to committee" search - not in the committee yet, so it has no status
export type AvailableCandidate = Omit<Candidate, 'status'>

// A group of the table: built in the client from the candidates' status (see candidatesStore)
export interface CandidateGroup {
  id: CandidateStatus
  // i18n key of the group title (the titles are fixed in the client)
  titleKey: string
  // TODO: the server does not send the total amount yet - decide where it comes from
  totalAmount?: number
  candidates: Candidate[]
}
