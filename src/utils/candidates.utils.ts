import type { Candidate } from '@/types/candidates'
import type { TableHeader } from '@/types/table'
import { formatDateString } from '@/utils/dateUtils'

// Raw (unformatted) value of a candidate for a column - used by search, sort and filter
export function getCandidateValue(candidate: Candidate, field: string): string {
  switch (field) {
    case 'name':
      // Name + pernr, so every candidate gets its own option in the column filter
      // (names can repeat) and the filter menu search also matches the pernr.
      // Sorting still works by name, since the value starts with it.
      return `${candidate.name} - ${candidate.pernr}`
    case 'unit':
      return candidate.unit
    case 'rank':
      return candidate.rank
    case 'age':
      return String(candidate.age)
    case 'tatash':
      return candidate.tatash
    default:
      return ''
  }
}

export function formatCandidateValue(raw: string, column: TableHeader): string {
  if (column.type === 'D') return formatDateString(raw)
  return raw
}

export function compareCandidateValues(a: string, b: string, column: TableHeader): number {
  if (column.type === 'N') return Number(a) - Number(b)
  // YYYYMMDD strings sort correctly as plain strings
  if (column.type === 'D') return a.localeCompare(b)
  return a.localeCompare(b, 'he')
}

// 100000 -> "100,000 ₪"
export function formatAmount(amount: number): string {
  return `${amount.toLocaleString('he-IL')} ₪`
}

const MIN_PERNR_DIGITS = 6
const MIN_NAME_LETTERS = 3

// The term to send to the server when searching for candidates to add, or null while the input is too short.
// Only digits = a pernr (needs 6 digits); anything with letters = a name (needs 3 letters, digits are kept in it).
// Spaces are not counted; a pernr is sent without spaces, a name is sent trimmed, with its inner spaces.
export function getCandidateSearchTerm(input: string): string | null {
  const term = input.trim()
  const chars = term.replace(/\s/g, '')
  if (/^\d+$/.test(chars)) {
    return chars.length >= MIN_PERNR_DIGITS ? chars : null
  }
  const letters = chars.match(/\p{L}/gu)?.length ?? 0
  return letters >= MIN_NAME_LETTERS ? term : null
}
