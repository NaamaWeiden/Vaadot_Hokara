// TODO: UI-stage types - align field names with the real OData $metadata once the service exists
export interface CandidateNote {
  text: string
  author: string
}

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
}

export interface CandidateGroup {
  id: string
  title: string
  totalAmount?: number
  candidates: Candidate[]
}
